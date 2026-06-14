const { XMLParser } = require('fast-xml-parser'); //XMLParser 공간을 할당 = fast-xml-parser 라이브러리안의 XMLParser도구를 찾아와서 넣어둔다(XML을 해석하는 번역기)
const { // serviceKey,emergencyApiUrl,stage1,stage2 공간 할당 = 파일 밖으로 한번 나가서 컨피그 내에 env 파일로 가서 각 객체에 맞는 형식을 저장한다
  serviceKey,
  emergencyApiUrl,
  seriousDiseaseApiUrl,
  stage1,
  stage2,
} = require('../config/env');
const { mapHospitals } = require('../utils/filterSuyeong'); // mapHospitals 공간 할당 = 파일 밖으로 한번 나가서 utils/filterSuyeong위치에 있는 mapHospitals 을 들고와 저장한다 

const xmlParser = new XMLParser({ ignoreAttributes: true }); // xmlParser 공간 할당 = 새로운 xmlParser 값을 저장할때 Attributes(api쪽에서 할당한 속성) 를 무시하고 json 값만 저장한다

function toItemList(items) {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function createApiUrl(apiUrl, extraParams = {}) {
  const url = new URL(apiUrl);
  const params = {
    serviceKey,
    STAGE1: stage1,
    STAGE2: stage2,
    pageNo: '1',
    numOfRows: '100',
    ...extraParams,
  };

  Object.entries(params).forEach(([name, value]) => {
    url.searchParams.set(name, value);
  });

  return url;
}

async function fetchAndParseApi(apiUrl, extraParams = {}) {
  const url = createApiUrl(apiUrl, extraParams);
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Public API HTTP error: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = xmlParser.parse(xml);
  const header = parsed?.response?.header;
  const code = header?.resultCode;
  const ok = code === '00' || code === 0 || code === '0';

  if (!ok) {
    throw new Error(header?.resultMsg || 'Public API returned an error');
  }

  return parsed?.response?.body || {};
}

function cleanSeriousDiseaseItem(item) {
  if (!item || typeof item !== 'object') return null;

  // XML 응답 필드가 달라져도 빈 값과 복합 객체만 제외하고 원본 필드는 안전하게 보존한다.
  return Object.fromEntries(
    Object.entries(item).filter(([, value]) => {
      if (value == null || typeof value === 'object') return false;
      return String(value).trim() !== '';
    }),
  );
}

function logRawHospitalItems(items) {
  const list = toItemList(items);

  console.log(
    '[emergencyApi] getEmrrmRltmUsefulSckbdInfoInqire raw item fields:',
    JSON.stringify(list, null, 2),
  );
}

async function fetchRealtimeBedInfo() {
  const body = await fetchAndParseApi(emergencyApiUrl);
  const items = body?.items?.item;
  logRawHospitalItems(items);

  return {
    totalCount: Number(body?.totalCount) || toItemList(items).length,
    items,
  };
}

async function fetchSeriousDiseaseInfo() {
  const body = await fetchAndParseApi(seriousDiseaseApiUrl, { SM_TYPE: '1' });
  return toItemList(body?.items?.item)
    .map(cleanSeriousDiseaseItem)
    .filter(Boolean);
}

function mergeSeriousDiseaseInfo(hospitals, seriousDiseaseItems) {
  const seriousDiseaseByHpid = new Map();

  seriousDiseaseItems.forEach((item) => {
    const hpid = String(item?.hpid ?? item?.HPID ?? '').trim();
    if (hpid) seriousDiseaseByHpid.set(hpid, item);
  });

  return hospitals.map((hospital) => ({
    ...hospital,
    seriousDiseaseInfo: seriousDiseaseByHpid.get(String(hospital?.id ?? '').trim()) || null,
  }));
}

async function fetchSuyeongHospitals() { // 기존 /api/hospitals 응답 안에서 두 공공 API 결과를 합친다.
  const [realtimeBedResult, seriousDiseaseItems] = await Promise.all([
    fetchRealtimeBedInfo(),
    // 중증질환 API가 일시적으로 실패해도 기존 병원 목록과 연락 기능은 계속 사용할 수 있게 한다.
    fetchSeriousDiseaseInfo().catch((err) => {
      console.error('[emergencyApi] Failed to fetch serious disease info:', err.message);
      return [];
    }),
  ]);
  const hospitals = mergeSeriousDiseaseInfo(
    mapHospitals(realtimeBedResult?.items),
    seriousDiseaseItems,
  );

  return { //함수 값을 도출하고 종료
    region: { stage1, stage2 }, //  지역이름 부산, 수영구
    totalCount: realtimeBedResult?.totalCount || hospitals.length,
    hospitals, // 병원 배열
  };
}

module.exports = { fetchSeriousDiseaseInfo, fetchSuyeongHospitals }; // 테스트와 재사용을 위해 두 조회 함수를 내보낸다
