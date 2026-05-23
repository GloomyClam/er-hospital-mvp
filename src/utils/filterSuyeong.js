/**
 * API 응답 item → 프론트용 병원 객체
 * (STAGE1/STAGE2로 이미 수영구만 조회; 추가 주소 필터는 응답에 없음)
 */
function formatUpdatedAt(hvidate) {
  const s = hvidate != null ? String(hvidate) : '';
  if (s.length < 14) {
    return s || null;
  }
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}`;
}

function toHospital(item) {
  return {
    id: item.hpid,
    name: item.dutyName,
    phone: item.dutyTel3,
    generalBeds: Number(item.hvec) || 0,
    surgeryBeds: Number(item.hvoc) || 0,
    totalBeds: Number(item.hvgc) || 0,
    icuBeds: Number(item.hvicc) || 0,
    updatedAt: formatUpdatedAt(item.hvidate),
  };
}

function mapHospitals(items) {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map(toHospital);
}

module.exports = { mapHospitals, toHospital };
