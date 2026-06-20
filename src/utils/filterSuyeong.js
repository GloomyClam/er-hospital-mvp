/**
 * 공공 API 응답 item을 프론트에서 사용하는 병원 객체로 변환한다.
 * STAGE1/STAGE2는 API 요청 단계에서 적용되므로 주소 문자열을 다시 필터링하지 않는다.
 */
function formatUpdatedAt(hvidate) {
  const value = hvidate != null ? String(hvidate) : '';
  if (value.length < 14) return value || null;

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)} `
    + `${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}`;
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

function toHospital(item) {
  return {
    id: getItemValue(item, 'hpid'),
    name: getItemValue(item, 'dutyName'),
    phone: getItemValue(item, 'dutyTel3', 'dutyTel1'),
    address: getItemValue(item, 'dutyAddr') || null,
    generalBeds: Number(getItemValue(item, 'hvec')) || 0,
    surgeryBeds: Number(getItemValue(item, 'hvoc')) || 0,
    totalBeds: Number(getItemValue(item, 'hvgc')) || 0,
    icuBeds: Number(getItemValue(item, 'hvicc')) || 0,
    updatedAt: formatUpdatedAt(getItemValue(item, 'hvidate')),
    seriousDiseaseInfo: null,
  };
}

function mapHospitals(items) {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map(toHospital);
}

module.exports = { mapHospitals, toHospital };
