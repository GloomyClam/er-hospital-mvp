const statusEl = document.getElementById('status'); // statusEl 값을 저장할 공간을 할당안다 = html 내의 아이디가 status인 요소를 찾아서 statusEl 이라는 변수애 담는다
const listEl = document.getElementById('hospital-list'); //listEl 값을 저장할 공간을 할당한다 = html 내의 아이디가 hospital-list인 요소를 찾아서 listEl라는 변수에 담는다
const excludedSectionEl = document.getElementById('excluded-section');
const excludedListEl = document.getElementById('excluded-list');
const patientStatusEls = document.querySelectorAll('input[name="patient-status"]');

let hospitalData = []; // API로 받아온 원본 병원 목록을 저장해두고, 선택값이 바뀔 때 다시 필터링한다.
let currentRegion = null;

const patientStatusRules = {
  general: {
    label: '일반 응급',
    field: 'generalBeds',
    reason: '응급실 병상 부족',
  },
  severe: {
    label: '중증 환자',
    field: 'icuBeds',
    reason: '중환자실 병상 부족',
  },
  surgery: {
    label: '수술 가능성 있음',
    field: 'surgeryBeds',
    reason: '수술실 가용 정보 부족',
  },
  admission: {
    label: '입원 가능성 있음',
    field: 'totalBeds',
    reason: '입원실 병상 부족',
  },
};

function setStatus(message, isError = false) { //setStatus 기능을 새로 만든다 받는값은 message고 에러여부도 확인한다, 값이 붙지 않으면 기본값은 false
  statusEl.textContent = message; //statusEl 내에 받아온 메세지를 옮겨적는다
  statusEl.classList.toggle('status--error', isError); //statusEl 안에 클래스를 추가한다, is error =ture 면 클래스명 status--error 를 달고, false 면 땐다(토글)
}

function renderCard(hospital, reasons = []) { // renderCard 기능을 만들고 받는값은 hospital
  const li = document.createElement('li'); //li 값을 저장할 공간을 할당 = 문서 내에 li 요소를 추가로 넣는다 
  li.className = reasons.length ? 'hospital-card hospital-card--excluded' : 'hospital-card';  // li의 클래스 이름은 hospital-card
  const reasonList = reasons
    .map((reason) => `<li>${escapeHtml(reason)}</li>`)
    .join('');

  li.innerHTML = ` <!--li 안의 내용을 아래의 내용으로 바꾼다 -->
    <h2>${escapeHtml(hospital.name)}</h2> <!-- 병원의 이름 -->
    <dl>
      <dt>응급실 연락처</dt>
      <dd>${hospital.phone ? `<a href="tel:${escapeHtml(hospital.phone)}">${escapeHtml(hospital.phone)}</a>` : '-'}</dd> <!--dd,dt,di은 설명값, 삼향 연상자 A ? B: C = A가 있으면 B를 보여주고 없으면 C를 보여준다  escapeHtml는 api에서 이상한 코드가 들어왔을때 문자열로 보여줌으로써 위험도를 낮춘다-->
      <dt>일반 병상</dt>
      <dd>${hospital.generalBeds}석</dd> <!-- api 내의 정보중 generalBeds 만 뽑아서 보여준다--> 
      <dt>수술실 병상</dt>
      <dd>${hospital.surgeryBeds}석</dd>
      <dt>총 병상</dt>
      <dd>${hospital.totalBeds}석</dd>
      <dt>중환자 병상</dt>
      <dd>${hospital.icuBeds}석</dd>
    </dl>
    ${hospital.updatedAt ? `<p class="updated">갱신: ${escapeHtml(hospital.updatedAt)}</p>` : ''} <!-- 병원 정보 업데이트 시간이 있다면 클래스가 업데이트인 요소를 넣고 그 안에 갱신: 업데이트 시간을 넣는다 그렇지 않으면 빈칸으로 놔둔다 -->
    ${reasonList ? `<div class="exclude-reasons"><strong>제외 이유</strong><ul>${reasonList}</ul></div>` : ''}
  `;
  return li; // li를 결과값으로 도출하고 함수 종료
}

function escapeHtml(text) { //escapeHtml 기능을 만듬 값은 텍스트만 받는다
  const div = document.createElement('div'); //div 공간을 할당하고 = 문서내에 div를 추가로 만든다
  div.textContent = text; //div 내의 텍스트는 = escapeHtml에서 받은 텍스트 값을 넣는다
  return div.innerHTML; //div 내의 값을 문자열로 도출한다 -> 위에서 해킹방지 목적으로 브라우저에서 문자열로 표시해야하기 때문
}

function getSelectedPatientStatus() {
  const checkedEl = document.querySelector('input[name="patient-status"]:checked');
  return checkedEl?.value || 'general';
}

function filterHospitalsByPatientStatus(hospitals, patientStatus) {
  const rule = patientStatusRules[patientStatus] || patientStatusRules.general;

  return hospitals.reduce(
    (result, hospital) => {
      const availableCount = Number(hospital[rule.field]) || 0;
      const reasons = [];

      // 현재 단계에서는 질환명이 아니라 API에 있는 가용 자원 숫자만 확인한다.
      if (availableCount < 1) {
        reasons.push(rule.reason);

        if (!hospital.updatedAt) {
          reasons.push('데이터 갱신 시간 확인 필요');
        }
      }

      if (reasons.length) {
        result.excluded.push({ hospital, reasons });
      } else {
        result.matched.push(hospital);
      }

      return result;
    },
    { matched: [], excluded: [] },
  );
}

function renderHospitalLists() {
  const patientStatus = getSelectedPatientStatus();
  const rule = patientStatusRules[patientStatus] || patientStatusRules.general;
  const { matched, excluded } = filterHospitalsByPatientStatus(hospitalData, patientStatus);
  const regionText = currentRegion ? `${currentRegion.stage1} ${currentRegion.stage2}` : '현재 지역';

  listEl.replaceChildren(...matched.map((hospital) => renderCard(hospital)));
  listEl.hidden = matched.length === 0;

  excludedListEl.replaceChildren(
    ...excluded.map(({ hospital, reasons }) => renderCard(hospital, reasons)),
  );
  excludedSectionEl.hidden = excluded.length === 0;

  if (matched.length) {
    setStatus(`${regionText} · ${rule.label} 조건 만족 ${matched.length}곳 · 제외 ${excluded.length}곳`);
  } else {
    setStatus(`${regionText} · ${rule.label} 조건을 만족하는 병원이 없습니다.`);
  }
}

async function loadHospitals() { // 비동기 기능(서버에서 받아온다) loadHospitals
  try { // 일단해봐
    const res = await fetch('/api/hospitals'); // res 공간 할당 = 비동기로 api를 받아온다
    const data = await res.json(); // data 공간할당 = 비동기로 res의 본문을 json형식으로 읽어서 자바스크립트 객체로 바꾼다 

    if (!res.ok) { // 만약 서버응답은 왔지만 404 에러와 같이 성공아 아나라면
      throw new Error(data.message || data.error || res.statusText); // 새로운 에러를 던진다 캐치쪽으로(데이터의 메시지 없으면 데이터 에러 없으면 res내의 statusText)
    }

    const { hospitals, region, totalCount } = data; // 데이터안의 속성 3개를 api에서 뽑아와서 각 변수상자에 나눠 담는다 

    if (!hospitals.length) {// 만약 배열안에 병원이 없다면(length)= 배열의 길이 배열이 0개면 length도 0
      setStatus(`${region.stage2}에 표시할 병원이 없습니다.`); // 받아온 메세지를 옮겨 적는다 (지역. 수영구)에 표시할 병원이 없다
      listEl.hidden = true;
      excludedSectionEl.hidden = true;
      return; //함수를 도출하고 종료
    }

    hospitalData = hospitals;
    currentRegion = region;
    renderHospitalLists();
    statusEl.hidden = false; //statusEl 의 히든 속성을 지운다
  } catch (err) {// 에러는 이곳으로 받는다
    setStatus(`오류: ${err.message}`, true); // 받아온 메세지를 옮겨 적는다 오류 (에러 내용) , 에러를 true로 바꾼다
    listEl.hidden = true; // listEl의 히든 속성을 true 로 바꾼다
    excludedSectionEl.hidden = true;
  }
}

patientStatusEls.forEach((radioEl) => {
  radioEl.addEventListener('change', renderHospitalLists);
});

loadHospitals(); // 실행
