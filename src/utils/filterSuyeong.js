/**
 * API 응답 item → 프론트용 병원 객체
 * (STAGE1/STAGE2로 이미 수영구만 조회; 추가 주소 필터는 응답에 없음)
 */
function formatUpdatedAt(hvidate) {  // formatUpdatedAt 기능을 만든다 받는값은 hvidate(api에서 받아온 갱신 시간 값을) ->  (api에서 받아온 갱신 시간 값을 보기 좋게 바꾸는 함수)
  const s = hvidate != null ? String(hvidate) : ''; // s 공간 할당 한다 =  hvidate가 널 값이 아니면 문자열로써 hvidate를 저장한다, 널 값이면 '' 빈칸을 저장한다
  if (s.length < 14) { // 만약 s의 길이가 14자리보다 짧으면 
    return s || null; // s 함수결과 값을 그대로 도출한다 결과값이 없으면 널을 출력하고 함수를 종료한다  
  }
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}`;
}// 변환된 날짜를 문자열을 도출한다 함수 값이 20260530025530면 0-4자리, 4-6자리 이렇게 끊어서 표시한다 -> 2026-05-30-02:55:30

function toCoordinate(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const coordinate = Number(value);
    if (Number.isFinite(coordinate)) return coordinate;
  }
  return null;
}

function parseCoordinatePair(value) {
  if (typeof value !== 'string') return { latitude: null, longitude: null };

  // dutyMapimg는 지도 설명 문자열일 수도 있으므로 숫자 좌표 두 개가 명확할 때만 사용한다.
  const coordinates = value.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (coordinates.length !== 2) return { latitude: null, longitude: null };

  const [latitude, longitude] = coordinates;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { latitude: null, longitude: null };
  }

  return { latitude, longitude };
}

function getItemValue(item, ...fieldNames) {
  if (!item || typeof item !== 'object') return undefined;
  const normalizedItem = Object.fromEntries(
    Object.entries(item).map(([key, value]) => [key.toLowerCase(), value]),
  );

  for (const fieldName of fieldNames) {
    const value = normalizedItem[fieldName.toLowerCase()];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function toHospital(item) { // toHospital 기능, 받는값은 item이다
  const mapImageCoordinates = parseCoordinatePair(getItemValue(item, 'dutyMapimg'));

  return { // 함수를 도출한다
    id: getItemValue(item, 'hpid'), // API 응답의 대소문자 차이와 관계없이 병원 식별자를 읽는다.
    name: getItemValue(item, 'dutyName'),
    phone: getItemValue(item, 'dutyTel3', 'dutyTel1'),
    address: getItemValue(item, 'dutyAddr') || null,
    generalBeds: Number(item.hvec) || 0, //generalBeds: 아이템 내의hvec 객체를 들고와 숫자로 바꾼다 숫자가 없으면 0을 출력
    surgeryBeds: Number(item.hvoc) || 0,
    totalBeds: Number(item.hvgc) || 0,
    icuBeds: Number(item.hvicc) || 0,
    // 공공 API별 필드명 차이를 고려해 알려진 좌표 후보를 순서대로 확인한다.
    latitude: toCoordinate(
      getItemValue(item, 'latitude'),
      getItemValue(item, 'lat'),
      getItemValue(item, 'wgs84Lat'),
      getItemValue(item, 'dutyMapLat'),
      mapImageCoordinates.latitude,
    ),
    longitude: toCoordinate(
      getItemValue(item, 'longitude'),
      getItemValue(item, 'lng'),
      getItemValue(item, 'wgs84Lon'),
      getItemValue(item, 'dutyMapLon'),
      getItemValue(item, 'lon'),
      mapImageCoordinates.longitude,
    ),
    updatedAt: formatUpdatedAt(item.hvidate),// updatedAt formatUpdatedAt 함수를 작동한다 받는 값은 item.hvidate
    seriousDiseaseInfo: null, // 중증질환 API 정보가 없거나 병합되지 않은 병원도 같은 객체 구조를 유지한다.
  };
}

function mapHospitals(items) { // mapHospitals 기능 items 을 받는다
  if (!items) return []; //  만약 items 이 없다면 빈 배열을 도출하고 함수종료
  const list = Array.isArray(items) ? items : [items]; // list 공간 할당 = 배열내 isArray애 받은 items을 넣는다 아이템이 배열이면 그대로 넣고 배열이 아니면 감싸서 배열로 넣어라 .map() 코드를 스기 위해선 무조건 배열이여야함
  return list.map(toHospital); //리스트 배열 안의 각 아이템을 toHospital 함수로 변환한 새 배열을 돌려준다
}

module.exports = { mapHospitals, toHospital }; // 기능을 다른곳에서 사용가능하도록한다
