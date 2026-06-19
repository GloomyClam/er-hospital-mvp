const { XMLParser } = require('fast-xml-parser'); //XMLParser 공간을 할당 = fast-xml-parser 라이브러리안의 XMLParser도구를 찾아와서 넣어둔다(XML을 해석하는 번역기)
const { // serviceKey,emergencyApiUrl,stage1,stage2 공간 할당 = 파일 밖으로 한번 나가서 컨피그 내에 env 파일로 가서 각 객체에 맞는 형식을 저장한다
  serviceKey,
  emergencyApiUrl,
  seriousDiseaseApiUrl,
  emergencyLocationApiUrl,
  stage1,
  stage2,
} = require('../config/env');
const { mapHospitals, toHospital } = require('../utils/filterSuyeong'); // 공공 API item을 프론트용 병원 객체로 정리하는 함수를 가져온다.

const xmlParser = new XMLParser({ ignoreAttributes: true }); // xmlParser 공간 할당 = 새로운 xmlParser 값을 저장할때 Attributes(api쪽에서 할당한 속성) 를 무시하고 json 값만 저장한다
const isDebugEnabled = process.env.NODE_ENV !== 'production';

function debugLog(...args) {
  if (isDebugEnabled) console.log(...args);
}

function debugWarn(...args) {
  if (isDebugEnabled) console.warn(...args);
}

// 프론트 거리 계산과 같은 부산 수영구청 인근 임시 기준 좌표를 위치 API 조회에도 사용한다.
const DEFAULT_SCENE_LOCATION = {
  lat: 35.1456,
  lng: 129.1131,
};

// 위치 API에서 좌표를 받지 못하는 동안 수영구 MVP 거리 기능만 검증하기 위한 임시 좌표다.
// 실제 운영 위치로 간주하면 안 되며, 신뢰할 수 있는 위치 API가 준비되면 제거해야 한다.
const FALLBACK_HOSPITAL_COORDINATES = {
  A1200007: { latitude: 35.1615, longitude: 129.1128 }, // 비에이치에스한서병원
  A1200008: { latitude: 35.1503, longitude: 129.1093 }, // 좋은강안병원
  A1200098: { latitude: 35.1668, longitude: 129.1136 }, // 센텀종합병원
};

function toItemList(items) {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function createApiUrl(apiUrl, extraParams = {}, options = {}) {
  const url = new URL(apiUrl);
  const params = {
    serviceKey,
    ...(options.extraParamsBeforePagination ? extraParams : {}),
    pageNo: '1',
    numOfRows: '100',
    ...(options.includeRegion === false ? {} : { STAGE1: stage1, STAGE2: stage2 }),
    ...(options.extraParamsBeforePagination ? {} : extraParams),
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

async function fetchAndParseApi(apiUrl, extraParams = {}, options = {}) {
  const url = createApiUrl(apiUrl, extraParams, options);
  if (options.logRequestUrl) {
    debugLog(`[${options.logRequestUrl}] request URL:`, getMaskedApiUrl(url));
  }
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

  debugLog(
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

async function fetchEmergencyLocationInfo() {
  const body = await fetchAndParseApi(
    emergencyLocationApiUrl,
    {
      WGS84_LON: String(DEFAULT_SCENE_LOCATION.lng),
      WGS84_LAT: String(DEFAULT_SCENE_LOCATION.lat),
    },
    {
      extraParamsBeforePagination: true,
      includeRegion: false,
      logRequestUrl: '위치 API',
    },
  );
  const items = toItemList(body?.items?.item);
  const firstItem = items[0] || null;
  const firstItemKeys = firstItem && typeof firstItem === 'object' ? Object.keys(firstItem) : [];
  const normalizedKeys = firstItemKeys.map((key) => key.toLowerCase());
  const normalizedFirstItem = firstItem ? toHospital(firstItem) : null;
  const coordinateCandidateFields = firstItemKeys.filter((key) => [
    'wgs84lat',
    'wgs84lon',
    'latitude',
    'longitude',
    'dutymaplat',
    'dutymaplon',
    'dutymapimg',
  ].includes(key.toLowerCase()));

  debugLog('[위치 API] item count:', items.length);
  debugLog('[위치 API] first item:', firstItem);
  debugLog('[위치 API] first item keys:', firstItemKeys);
  debugLog('[위치 API] hpid field exists:', normalizedKeys.includes('hpid'));
  debugLog('[위치 API] first item hpid:', normalizedFirstItem?.id ?? null);
  debugLog('[위치 API] first item latitude:', normalizedFirstItem?.latitude ?? null);
  debugLog('[위치 API] first item longitude:', normalizedFirstItem?.longitude ?? null);
  debugLog('[위치 API] coordinate candidate fields:', coordinateCandidateFields);

  if (!items.length) {
    debugWarn(
      '[위치 API] WGS84_LON/WGS84_LAT 좌표 기반 조회 결과가 0개입니다.',
    );
  } else if (!normalizedKeys.includes('hpid')) {
    const mergeCandidateFields = firstItemKeys.filter((key) => [
      'dutyname',
      'dutyaddr',
      'dutytel1',
      'dutytel3',
    ].includes(key.toLowerCase()));
    debugWarn('[위치 API] hpid가 없어 hpid 병합이 불가능합니다. 병합 후보 필드:', mergeCandidateFields);
  }

  return items;
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

function mergeEmergencyLocationInfo(hospitals, locationItems) {
  const locationByHpid = new Map();

  locationItems.forEach((item) => {
    const normalizedLocation = toHospital(item);
    const hpid = String(normalizedLocation.id ?? '').trim();
    if (!hpid) return;

    // 위치 API도 필드명 차이가 있을 수 있으므로 기존 병원 정규화 과정을 그대로 재사용한다.
    locationByHpid.set(hpid, normalizedLocation);
  });

  return hospitals.map((hospital) => {
    const location = locationByHpid.get(String(hospital?.id ?? '').trim());
    if (!location) return hospital;

    return {
      ...hospital,
      name: hospital.name || location.name,
      phone: hospital.phone || location.phone,
      address: hospital.address || location.address,
      latitude: location.latitude ?? hospital.latitude,
      longitude: location.longitude ?? hospital.longitude,
    };
  });
}

function applyFallbackHospitalCoordinates(hospitals) {
  return hospitals.map((hospital) => {
    // 위치 API에서 위도와 경도를 모두 받은 병원은 fallback보다 API 좌표를 우선한다.
    if (hospital.latitude != null && hospital.longitude != null) return hospital;

    const hospitalId = String(hospital?.id ?? '').trim();
    const fallbackCoordinates = FALLBACK_HOSPITAL_COORDINATES[hospitalId];
    if (!fallbackCoordinates) return hospital;

    debugLog(`[위치 fallback] ${hospital.name || '알 수 없는 병원'} ${hospitalId} 좌표 적용`);
    return {
      ...hospital,
      latitude: fallbackCoordinates.latitude,
      longitude: fallbackCoordinates.longitude,
    };
  });
}

async function fetchSuyeongHospitals() { // 기존 /api/hospitals 응답 안에서 공공 API 결과를 hpid 기준으로 합친다.
  const [realtimeBedResult, seriousDiseaseItems, locationItems] = await Promise.all([
    fetchRealtimeBedInfo(),
    // 중증질환 API가 일시적으로 실패해도 기존 병원 목록과 연락 기능은 계속 사용할 수 있게 한다.
    fetchSeriousDiseaseInfo().catch((err) => {
      console.error('[emergencyApi] Failed to fetch serious disease info:', err.message);
      return [];
    }),
    // 위치 API 장애는 거리 정보만 생략하고 기존 병원 목록에는 영향을 주지 않는다.
    fetchEmergencyLocationInfo().catch((err) => {
      console.error('[emergencyApi] Failed to fetch emergency location info:', err.message);
      return [];
    }),
  ]);
  const hospitalsWithLocation = applyFallbackHospitalCoordinates(
    mergeEmergencyLocationInfo(
      mapHospitals(realtimeBedResult?.items),
      locationItems,
    ),
  );
  const hospitals = mergeSeriousDiseaseInfo(
    hospitalsWithLocation,
    seriousDiseaseItems,
  );
  const firstMergedHospital = hospitals[0];
  debugLog('[병합 후 병원]', firstMergedHospital ? {
    name: firstMergedHospital.name,
    hpid: firstMergedHospital.id,
    address: firstMergedHospital.address,
    latitude: firstMergedHospital.latitude,
    longitude: firstMergedHospital.longitude,
  } : null);

  return { //함수 값을 도출하고 종료
    region: { stage1, stage2 }, //  지역이름 부산, 수영구
    totalCount: realtimeBedResult?.totalCount || hospitals.length,
    hospitals, // 병원 배열
  };
}

module.exports = {
  fetchEmergencyLocationInfo,
  fetchSeriousDiseaseInfo,
  fetchSuyeongHospitals,
}; // 테스트와 재사용을 위해 조회 함수를 내보낸다
