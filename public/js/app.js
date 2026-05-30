const statusEl = document.getElementById('status'); // statusEl 값을 저장할 공간을 할당안다 = html 내의 아이디가 status인 요소를 찾아서 statusEl 이라는 변수애 담는다
const listEl = document.getElementById('hospital-list'); //listEl 값을 저장할 공간을 할당한다 = html 내의 아이디가 hospital-list인 요소를 찾아서 listEl라는 변수에 담는다
const excludedSectionEl = document.getElementById('excluded-section');
const excludedListEl = document.getElementById('excluded-list');
const patientStatusEls = document.querySelectorAll('input[name="patient-status"]');
const acceptedHospitalEl = document.getElementById('accepted-hospital');
const contactHistoryListEl = document.getElementById('contact-history-list');
const emptyContactHistoryEl = document.getElementById('empty-contact-history');
const CONTACT_STORAGE_KEY = 'erHospitalContactStatuses';
const CONTACT_HISTORY_STORAGE_KEY = 'erHospitalContactHistory';

let hospitalData = []; // API로 받아온 원본 병원 목록을 저장해두고, 선택값이 바뀔 때 다시 필터링한다.
let currentRegion = null;
let contactStatusByHospitalId = loadContactStatuses();
let contactHistory = loadContactHistory();
let contactErrorByHospitalId = {};

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

const contactStatusLabels = {
  calling: '연락 중',
  accepted: '수락',
  rejected: '거절',
  noAnswer: '응답 없음',
};

const rejectionReasons = [
  '병상 부족',
  '해당 환자 수용 불가',
  '전문의/장비 부재',
  '기타',
];

function setStatus(message, isError = false) { //setStatus 기능을 새로 만든다 받는값은 message고 에러여부도 확인한다, 값이 붙지 않으면 기본값은 false
  statusEl.textContent = message; //statusEl 내에 받아온 메세지를 옮겨적는다
  statusEl.classList.toggle('status--error', isError); //statusEl 안에 클래스를 추가한다, is error =ture 면 클래스명 status--error 를 달고, false 면 땐다(토글)
}

function renderCard(hospital, reasons = [], scoreInfo = null) { // renderCard 기능을 만들고 받는값은 hospital
  const li = document.createElement('li'); //li 값을 저장할 공간을 할당 = 문서 내에 li 요소를 추가로 넣는다 
  li.className = reasons.length ? 'hospital-card hospital-card--excluded' : 'hospital-card';  // li의 클래스 이름은 hospital-card
  const contactControls = renderContactControls(hospital);
  const reasonList = reasons
    .map((reason) => `<li>${escapeHtml(reason)}</li>`)
    .join('');
  const scoreReasonList = scoreInfo?.reasons
    ?.map((reason) => {
      // 점수 이유는 "설명"과 "몇 점이 더해졌는지"를 같이 보여줘서 정렬 이유를 알 수 있게 한다.
      if (typeof reason === 'string') {
        return `<li>${escapeHtml(reason)}</li>`;
      }

      const pointText = reason.points > 0 ? `<span class="score-point">+${reason.points}</span>` : '';
      return `<li>${escapeHtml(reason.label)} ${pointText}</li>`;
    })
    .join('');

  li.innerHTML = ` <!--li 안의 내용을 아래의 내용으로 바꾼다 -->
    <h2>${escapeHtml(hospital.name)}</h2> <!-- 병원의 이름 -->
    ${scoreInfo ? `
      <div class="resource-score">
        <strong>자원 여유 점수</strong>
        <span>${scoreInfo.score}점</span>
        ${scoreReasonList ? `<ul>${scoreReasonList}</ul>` : ''}
      </div>
    ` : ''}
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
    ${contactControls}
    ${reasonList ? `<div class="exclude-reasons"><strong>제외 이유</strong><ul>${reasonList}</ul></div>` : ''}
  `;
  return li; // li를 결과값으로 도출하고 함수 종료
}

function escapeHtml(text) { //escapeHtml 기능을 만듬 값은 텍스트만 받는다
  const div = document.createElement('div'); //div 공간을 할당하고 = 문서내에 div를 추가로 만든다
  div.textContent = text; //div 내의 텍스트는 = escapeHtml에서 받은 텍스트 값을 넣는다
  return div.innerHTML; //div 내의 값을 문자열로 도출한다 -> 위에서 해킹방지 목적으로 브라우저에서 문자열로 표시해야하기 때문
}

function loadContactStatuses() {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_STORAGE_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function saveContactStatuses() {
  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contactStatusByHospitalId));
}

function loadContactHistory() {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_HISTORY_STORAGE_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function saveContactHistory() {
  localStorage.setItem(CONTACT_HISTORY_STORAGE_KEY, JSON.stringify(contactHistory));
}

function getHospitalId(hospital) {
  return hospital.id;
}

function findHospitalName(hospitalId) {
  return hospitalData.find((hospital) => getHospitalId(hospital) === hospitalId)?.name || '알 수 없는 병원';
}

function getActiveCallingHospitalId() {
  return Object.keys(contactStatusByHospitalId).find(
    (hospitalId) => contactStatusByHospitalId[hospitalId]?.status === 'calling',
  );
}

function renderContactControls(hospital) {
  const hospitalId = getHospitalId(hospital);
  const contactStatus = contactStatusByHospitalId[hospitalId];
  const activeCallingHospitalId = getActiveCallingHospitalId();
  const isCallingThisHospital = activeCallingHospitalId === hospitalId;
  const isLockedByOtherHospital = activeCallingHospitalId && !isCallingThisHospital;
  const disabledText = isLockedByOtherHospital ? 'disabled' : '';
  const rejectionOptions = rejectionReasons
    .map((reason) => `<option value="${escapeHtml(reason)}">${escapeHtml(reason)}</option>`)
    .join('');
  const latestResult = contactStatus && contactStatus.status !== 'calling'
    ? `<p class="contact-result">최근 결과: ${escapeHtml(contactStatusLabels[contactStatus.status])}${contactStatus.rejectionReason ? ` · ${escapeHtml(contactStatus.rejectionReason)}` : ''}</p>`
    : '';
  const errorMessage = contactErrorByHospitalId[hospitalId]
    ? `<p class="contact-error">${escapeHtml(contactErrorByHospitalId[hospitalId])}</p>`
    : '';

  // 연락 중인 병원이 있으면 결과를 기록하기 전까지 다른 병원의 연락 액션을 잠근다.
  if (isCallingThisHospital) {
    return `
      <div class="contact-panel" data-hospital-id="${escapeHtml(hospitalId)}">
        <p class="contact-status">연락 중</p>
        <div class="contact-actions">
          <button type="button" data-contact-action="accepted">수락</button>
          <button type="button" data-contact-action="rejected">거절</button>
          <button type="button" data-contact-action="noAnswer">응답 없음</button>
        </div>
        <label class="rejection-reason">
          거절 사유
          <select data-rejection-reason>
            <option value="">거절 사유 선택</option>
            ${rejectionOptions}
          </select>
        </label>
        ${errorMessage}
      </div>
    `;
  }

  return `
    <div class="contact-panel" data-hospital-id="${escapeHtml(hospitalId)}">
      ${latestResult}
      <button type="button" data-contact-action="calling" ${disabledText}>
        전화하기
      </button>
    </div>
  `;
}

function updateContactStatus(hospitalId, nextStatus, extra = {}) {
  contactStatusByHospitalId[hospitalId] = {
    status: nextStatus,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
  saveContactStatuses();
}

function addContactHistory(hospitalId, resultStatus, extra = {}) {
  const recordedAt = new Date().toISOString();

  // 카드의 최근 결과와 별도로, 전체 연락 흐름을 시간순 기록으로 남긴다.
  contactHistory.push({
    id: `${hospitalId}-${recordedAt}`,
    order: contactHistory.length + 1,
    hospitalId,
    hospitalName: findHospitalName(hospitalId),
    resultStatus,
    rejectionReason: extra.rejectionReason || '',
    recordedAt,
  });
  saveContactHistory();
}

function formatRecordedAt(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function renderContactHistory() {
  const normalizedHistory = contactHistory.map((history, index) => ({
    ...history,
    order: history.order || index + 1,
    hospitalName: history.hospitalName || findHospitalName(history.hospitalId),
  }));
  const acceptedHistory = [...normalizedHistory]
    .reverse()
    .find((history) => history.resultStatus === 'accepted');

  if (acceptedHistory) {
    acceptedHospitalEl.hidden = false;
    acceptedHospitalEl.innerHTML = `
      <strong>최종 수락 병원</strong>
      <span>${escapeHtml(acceptedHistory.hospitalName)}</span>
      <small>${escapeHtml(formatRecordedAt(acceptedHistory.recordedAt))}</small>
    `;
  } else {
    acceptedHospitalEl.hidden = true;
    acceptedHospitalEl.replaceChildren();
  }

  contactHistoryListEl.replaceChildren(
    ...normalizedHistory.map((history) => {
      const li = document.createElement('li');
      li.className = history.resultStatus === 'accepted'
        ? 'contact-history-item contact-history-item--accepted'
        : 'contact-history-item';
      li.innerHTML = `
        <span class="history-order">${history.order}</span>
        <div>
          <strong>${escapeHtml(history.hospitalName)}</strong>
          <p>${escapeHtml(contactStatusLabels[history.resultStatus])}${history.rejectionReason ? ` · ${escapeHtml(history.rejectionReason)}` : ''}</p>
          <time>${escapeHtml(formatRecordedAt(history.recordedAt))}</time>
        </div>
      `;
      return li;
    }),
  );

  emptyContactHistoryEl.hidden = normalizedHistory.length > 0;
}

function handleContactClick(event) {
  const buttonEl = event.target.closest('[data-contact-action]');
  if (!buttonEl || buttonEl.disabled) return;

  const panelEl = buttonEl.closest('[data-hospital-id]');
  const hospitalId = panelEl?.dataset.hospitalId;
  const action = buttonEl.dataset.contactAction;
  if (!hospitalId || !action) return;

  delete contactErrorByHospitalId[hospitalId];

  if (action === 'calling') {
    updateContactStatus(hospitalId, 'calling', { startedAt: new Date().toISOString() });
    renderHospitalLists();
    return;
  }

  if (action === 'rejected') {
    const rejectionReason = panelEl.querySelector('[data-rejection-reason]')?.value;
    if (!rejectionReason) {
      contactErrorByHospitalId[hospitalId] = '거절 사유를 선택해야 기록할 수 있습니다.';
      renderHospitalLists();
      return;
    }

    updateContactStatus(hospitalId, 'rejected', {
      rejectionReason,
      completedAt: new Date().toISOString(),
    });
    addContactHistory(hospitalId, 'rejected', { rejectionReason });
    renderContactHistory();
    renderHospitalLists();
    return;
  }

  updateContactStatus(hospitalId, action, { completedAt: new Date().toISOString() });
  addContactHistory(hospitalId, action);
  renderContactHistory();
  renderHospitalLists();
}

function toAvailableCount(value) {
  return Math.max(Number(value) || 0, 0);
}

function addResourceScore(scoreInfo, label, count, maxCount, pointPerCount) {
  const score = Math.min(count, maxCount) * pointPerCount;

  if (score > 0) {
    scoreInfo.score += score;
    scoreInfo.reasons.push({
      label: `${label} ${count}석 반영`,
      points: score,
    });
    scoreInfo.breakdown.resourceDetails.push({
      label,
      count,
      points: score,
    });
  }
}

function calculateResourceScore(hospital) {
  const scoreInfo = {
    score: 0,
    reasons: [],
    breakdown: {
      resourceScore: 0,
      resourceDetails: [],
      distanceScore: null,
      specialtyScore: null,
      freshnessScore: null,
    },
  };

  // 현재 점수는 추천 점수가 아니라 API에 있는 병상/시설 여유만 반영한 resourceScore다.
  addResourceScore(scoreInfo, '응급실 병상', toAvailableCount(hospital.generalBeds), 10, 5);
  addResourceScore(scoreInfo, '중환자실 병상', toAvailableCount(hospital.icuBeds), 5, 8);
  addResourceScore(scoreInfo, '수술실', toAvailableCount(hospital.surgeryBeds), 5, 7);
  addResourceScore(scoreInfo, '입원실 병상', toAvailableCount(hospital.totalBeds), 20, 2);

  if (hospital.updatedAt) {
    const freshnessPoints = 3;
    scoreInfo.score += freshnessPoints;
    scoreInfo.reasons.push({
      label: '갱신 시간 확인됨',
      points: freshnessPoints,
    });
    scoreInfo.breakdown.resourceDetails.push({
      label: '갱신 시간',
      count: 1,
      points: freshnessPoints,
    });
  } else {
    scoreInfo.reasons.push({
      label: '갱신 시간 확인 필요',
      points: 0,
    });
  }

  scoreInfo.breakdown.resourceScore = scoreInfo.score;

  return scoreInfo;
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
  const scoredHospitals = matched
    .map((hospital) => ({
      hospital,
      scoreInfo: calculateResourceScore(hospital),
    }))
    .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score);

  listEl.replaceChildren(
    ...scoredHospitals.map(({ hospital, scoreInfo }) => renderCard(hospital, [], scoreInfo)),
  );
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
listEl.addEventListener('click', handleContactClick);
excludedListEl.addEventListener('click', handleContactClick);

renderContactHistory();
loadHospitals(); // 실행
