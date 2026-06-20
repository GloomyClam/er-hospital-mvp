const { XMLParser } = require('fast-xml-parser');
const {
  serviceKey,
  emergencyApiUrl,
  seriousDiseaseApiUrl,
  stage1: defaultStage1,
  stage2: defaultStage2,
} = require('../config/env');
const { mapHospitals } = require('../utils/filterSuyeong');

const xmlParser = new XMLParser({ ignoreAttributes: true });
const isDebugEnabled = process.env.NODE_ENV !== 'production';

function debugLog(...args) {
  if (isDebugEnabled) console.log(...args);
}

function toItemList(items) {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function createApiUrl(apiUrl, region, extraParams = {}) {
  const url = new URL(apiUrl);
  const params = {
    serviceKey,
    pageNo: '1',
    numOfRows: '100',
    STAGE1: region.stage1,
    STAGE2: region.stage2,
    ...extraParams,
  };

  Object.entries(params).forEach(([name, value]) => {
    url.searchParams.set(name, value);
  });

  return url;
}

function getMaskedApiUrl(url) {
  const maskedUrl = new URL(url.toString());
  if (maskedUrl.searchParams.has('serviceKey')) {
    maskedUrl.searchParams.set('serviceKey', '***MASKED***');
  }
  return maskedUrl.toString();
}

async function fetchAndParseApi(apiUrl, region, extraParams = {}) {
  const url = createApiUrl(apiUrl, region, extraParams);
  debugLog('[공공 API] request URL:', getMaskedApiUrl(url));
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
  debugLog(
    '[emergencyApi] getEmrrmRltmUsefulSckbdInfoInqire raw item fields:',
    JSON.stringify(toItemList(items), null, 2),
  );
}

async function fetchRealtimeBedInfo(region) {
  const body = await fetchAndParseApi(emergencyApiUrl, region);
  const items = body?.items?.item;
  logRawHospitalItems(items);

  return {
    totalCount: Number(body?.totalCount) || toItemList(items).length,
    items,
  };
}

async function fetchSeriousDiseaseInfo(
  region = { stage1: defaultStage1, stage2: defaultStage2 },
) {
  const body = await fetchAndParseApi(
    seriousDiseaseApiUrl,
    region,
    { SM_TYPE: '1' },
  );

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

async function fetchHospitals(
  region = { stage1: defaultStage1, stage2: defaultStage2 },
) {
  const [realtimeBedResult, seriousDiseaseItems] = await Promise.all([
    fetchRealtimeBedInfo(region),
    // 중증질환 API가 일시적으로 실패해도 기존 병원 목록과 연락 기능은 계속 사용한다.
    fetchSeriousDiseaseInfo(region).catch((err) => {
      console.error('[emergencyApi] Failed to fetch serious disease info:', err.message);
      return [];
    }),
  ]);
  const hospitals = mergeSeriousDiseaseInfo(
    mapHospitals(realtimeBedResult?.items),
    seriousDiseaseItems,
  );

  return {
    region,
    totalCount: realtimeBedResult?.totalCount || hospitals.length,
    hospitals,
  };
}

module.exports = {
  fetchHospitals,
  fetchSeriousDiseaseInfo,
};
