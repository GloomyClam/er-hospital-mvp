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

function toHospital(item) { // toHospital 기능, 받는값은 item이다
  return { // 함수를 도출한다
    id: item.hpid, //  id: 아이템 내의 hpid
    name: item.dutyName, //  name: 아이템 내의 dutyName
    phone: item.dutyTel3, // phone : 아이템 내의 dutyTel3값
    generalBeds: Number(item.hvec) || 0, //generalBeds: 아이템 내의hvec 객체를 들고와 숫자로 바꾼다 숫자가 없으면 0을 출력
    surgeryBeds: Number(item.hvoc) || 0,
    totalBeds: Number(item.hvgc) || 0,
    icuBeds: Number(item.hvicc) || 0,
    updatedAt: formatUpdatedAt(item.hvidate),// updatedAt formatUpdatedAt 함수를 작동한다 받는 값은 item.hvidate
  };
}

function mapHospitals(items) { // mapHospitals 기능 items 을 받는다
  if (!items) return []; //  만약 items 이 없다면 빈 배열을 도출하고 함수종료
  const list = Array.isArray(items) ? items : [items]; // list 공간 할당 = 배열내 isArray애 받은 items을 넣는다 아이템이 배열이면 그대로 넣고 배열이 아니면 감싸서 배열로 넣어라 
  return list.map(toHospital); // 함수를 도출한다 리스트내의 맵에 toHospital형식으로 저장되는 배열을
}

module.exports = { mapHospitals, toHospital }; // 기능을 다른곳에서 사용가능하도록한다
