// DOM 요소: 화면에서 자주 사용하는 요소를 시작할 때 한 번만 찾는다.
const DEBUG = false; // 배포 화면에서는 개발 확인용 브라우저 로그를 출력하지 않는다.

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

const statusEl = document.getElementById('status'); // (병원 정보 상태를 나타냄)statusEl 값을 저장할 공간을 할당안다 = html 내의 아이디가 status인 요소를 찾아서 statusEl 이라는 변수애 담는다
const listEl = document.getElementById('hospital-list'); //(병원 카드 list)listEl 값을 저장할 공간을 할당한다 = html 내의 아이디가 hospital-list인 요소를 찾아서 listEl라는 변수에 담는다
const excludedSectionEl = document.getElementById('excluded-section');  // (제외된 병원 전체)excludedSectionEl 공간할당
const excludedListEl = document.getElementById('excluded-list'); // (제외돤 병원 list)excludedListEl 공간할당
const patientStatusEls = document.querySelectorAll('input[name="patient-status"]'); // name="patient-status"를 포함하는 모든 input
const acceptedHospitalEl = document.getElementById('accepted-hospital'); //(타임라인에 수락한 병원을 보여줌) acceptedHospitalEl 공간할당
const contactHistoryListEl = document.getElementById('contact-history-list'); // (모든 타임라인을 보여줌) contactHistoryListEl 공간할당
const emptyContactHistoryEl = document.getElementById('empty-contact-history');// (아직 타임라인이 없을때 문구를 출력하는 공간 ) emptyContactHistoryEl 공간할당
const newTransferButtonEl = document.getElementById('new-transfer-button'); //(새 이송 시작 버튼) newTransferButtonEl 공간할당
const completedCasesListEl = document.getElementById('completed-cases-list'); // 최근 완료된 이송 기록을 보여줄 목록
const emptyCompletedCasesEl = document.getElementById('empty-completed-cases'); // 완료 기록이 없을 때 보여줄 안내 문구
const exportCompletedCasesButtonEl = document.getElementById('export-completed-cases-button'); // 완료 이송 기록 CSV 다운로드 버튼
const completedCasesExportMessageEl = document.getElementById('completed-cases-export-message'); // 내보내기 결과 안내 문구
const patientInputEls = document.querySelectorAll('[name="patientCategory"], [name="chiefComplaint"], [name="mentalStatus"], [name="systolicBp"], [name="diastolicBp"], [name="heartRate"], [name="respiratoryRate"], [name="spo2"], [name="temperature"], [name="bloodSugar"], [name="painScore"], [name="memo"]'); // (환자정보 에 관련된 공간) patientInputEls 공간할당
const patientVitalErrorEl = document.getElementById('patient-vital-error'); // 활력징후가 허용 범위를 벗어나면 보여줄 안내 문구 영역
const contactModalEl = document.getElementById('contact-modal'); //( 병원 연락 팝업창에 관련된 공간) contactModalEl 공간할당
const contactModalTitleEl = document.getElementById('contact-modal-title'); // (병원 연락 팝업창 타이틀에 관련된 공간) contactModalTitleEl 공간할당
const contactModalCloseEl = document.getElementById('contact-modal-close'); // (병원 연락 팝업창 종료에 관련된 공간) contactModalCloseEl 공간할당
const modalPatientSummaryEl = document.getElementById('modal-patient-summary'); //(병원 연락 팝업창 환자상태 요약에 관련된 공간) modalPatientSummaryEl 공간할당
const modalCallAreaEl = document.getElementById('modal-call-area'); //(병원 연락 팝업창 병원 전화번호에 관련된 공간) modalCallAreaEl 공간할당
const modalRejectionReasonEl = document.getElementById('modal-rejection-reason'); // (병원 연락 팝업창 거절이유에 관련된 공간) modalRejectionReasonEl 공간할당
const modalContactErrorEl = document.getElementById('modal-contact-error'); // (병원 연락 팝업창 에러에 관련된 공간) modalContactErrorEl 공간할당
const modalResultButtonEls = document.querySelectorAll('[data-modal-result]'); // (병원 연락 팝업창 안의 수락/거절/응답없음 버튼에 관련된 공간)
const CONTACT_STORAGE_KEY = 'erHospitalContactStatuses';  //CONTACT_STORAGE_KEY 공간할당 (병원별 현재 연락 상태를 저장하는 공간)
const CONTACT_HISTORY_STORAGE_KEY = 'erHospitalContactHistory'; //CONTACT_HISTORY_STORAGE_KEY(병원에 연락을 한 순서, 결과를 저장하는 공간)
const PATIENT_INFO_STORAGE_KEY = 'erHospitalPatientInfo'; //PATIENT_INFO_STORAGE_KEY (환자정보를 저장하는 공간)
const CURRENT_TRANSPORT_CASE_STORAGE_KEY = 'erHospitalCurrentTransportCase'; // 기존 저장값을 유지하면서 현재 이송을 한 묶음으로 확인하기 위한 추가 저장 공간
const COMPLETED_TRANSPORT_CASES_STORAGE_KEY = 'erHospitalCompletedTransportCases'; // 수락 완료된 이송 케이스를 배열로 보관하는 공간

// 앱 상태: API 원본 데이터와 현재 이송에서 바뀌는 값을 메모리에 보관한다.
let hospitalData = []; // hospitalData 공간할당 기본값은 빈 배열이고 나중에 API로 받아온 원본 병원 목록을 저장해두고, 선택값이 바뀔 때 다시 필터링한다.
let currentRegion = null;  // 값안에 널값을 저장해둔다(현재 화면에 표시중인 지역을 알려주는 변수, api 값을 받기 전에는 널값을 저장해둔다)
let contactStatusByHospitalId = loadContactStatuses(); //contactStatusByHospitalId 공간 할당, loadContactStatuses를 실행하고 로컬 스토리지에 저장된 병원별 연락 상태 결과값을 불러와 저장한다(연락 기록을 꺼내온다)
let contactHistory = loadContactHistory(); // loadContactHistory를 실행하고 결과값을 저장한다 ( 연락 이력을 들고오는 코드)
let patientInfo = loadPatientInfo(); // patientInfo 공간을 할당 환자정보를 불러와서 저장한다
let currentTransportCase = loadCurrentTransportCase(); // 기존 개별 저장값과 함께 관리할 현재 이송 케이스
let completedTransportCases = loadCompletedTransportCases(); // 새 이송을 시작해도 유지할 완료 이송 이력
let activeModalHospitalId = null; // activeModalHospitalId 공간할당 널값을 저장해둔다(지금 어떤 병원을 대상으로 팝업창이 열려있는지 저장하는 변수, 처음은 선택을 안했으니 널값)

const patientStatusRules = { // patientStatusRules 공간할당(환자 이송 규칙표)
  general: {  // 이송중인 환자 상태에 따른 속성과 어떤 자원을 봐야할지 그에따른 거절 멘트를 저장한다
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

const contactStatusLabels = { //contactStatusLabels 공간할당 각 연락상태별 상태 메시지를 정해놓는다
  calling: '연락 중',
  accepted: '수락',
  rejected: '거절',
  noAnswer: '응답 없음',
};

const mentalStatusLabels = { // 의식 상태의 저장값을 환자 요약에서 사용할 화면 라벨로 바꾼다.
  alert: 'Alert',
  drowsy: 'Drowsy',
  stupor: 'Stupor',
  semiComa: 'Semi-coma',
  coma: 'Coma',
};

const patientCategoryLabels = { // 환자 구분은 병상 필터가 아닌 현장 분류용 선택값이다.
  none: '선택 안 함',
  cardiovascular: '흉통/심혈관',
  stroke: '뇌졸중 의심',
  trauma: '중증외상',
  burn: '화상',
  maternity: '산모/분만',
  pediatric: '소아 중증',
  poisoning: '중독',
  other: '기타',
};

const vitalSignRules = { // 빈 값은 허용하고, 숫자가 입력된 항목만 아래 범위를 확인한다.
  systolicBp: { label: '수축기 혈압', min: 0, max: 300, unit: 'mmHg' },
  diastolicBp: { label: '이완기 혈압', min: 0, max: 200, unit: 'mmHg' },
  heartRate: { label: '심박수', min: 0, max: 250, unit: '/min' },
  respiratoryRate: { label: '호흡수', min: 0, max: 80, unit: '/min' },
  spo2: { label: '산소포화도', min: 0, max: 100, unit: '%' },
  temperature: { label: '체온', min: 0, max: 45, unit: '℃' },
  bloodSugar: { label: '혈당', min: 0, max: 999, unit: 'mg/dL' },
  painScore: { label: '통증 수치', min: 0, max: 10, unit: '' },
};

const seriousDiseaseFieldLabels = {
  mkioskty28: '응급실',
  mkioskty1: '[재관류중재술] 심근경색',
  mkioskty2: '[재관류중재술] 뇌경색',
  mkioskty3: '[뇌출혈수술] 거미막하출혈',
  mkioskty4: '[뇌출혈수술] 거미막하출혈 외',
  mkioskty5: '[대동맥응급] 흉부',
  mkioskty6: '[대동맥응급] 복부',
  mkioskty7: '[담낭담관질환] 담낭질환',
  mkioskty8: '[담낭담관질환] 담도포함질환',
  mkioskty9: '[복부응급수술] 비외상',
  mkioskty10: '[장중첩/폐색] 영유아',
  mkioskty11: '[응급내시경] 성인 위장관',
  mkioskty12: '[응급내시경] 영유아 위장관',
  mkioskty13: '[응급내시경] 성인 기관지',
  mkioskty14: '[응급내시경] 영유아 기관지',
  mkioskty15: '[저체중출생아] 집중치료',
  mkioskty16: '[산부인과응급] 분만',
  mkioskty17: '[산부인과응급] 산과수술',
  mkioskty18: '[산부인과응급] 부인과수술',
  mkioskty19: '[중증화상] 전문치료',
  mkioskty20: '[사지접합] 수족지접합',
  mkioskty21: '[사지접합] 수족지접합 외',
  mkioskty22: '[응급투석] HD',
  mkioskty23: '[응급투석] CRRT',
  mkioskty24: '[정신과적응급] 폐쇄병동입원',
  mkioskty25: '[안과적수술] 응급',
  mkioskty26: '[영상의학혈관중재] 성인',
  mkioskty27: '[영상의학혈관중재] 영유아',
};

const seriousDiseaseFieldsByPatientCategory = {
  cardiovascular: ['mkioskty1', 'mkioskty5', 'mkioskty6'],
  stroke: ['mkioskty2', 'mkioskty3', 'mkioskty4'],
  trauma: ['mkioskty20', 'mkioskty21'],
  burn: ['mkioskty19'],
  maternity: ['mkioskty16', 'mkioskty17', 'mkioskty18'],
  pediatric: ['mkioskty10', 'mkioskty12', 'mkioskty14', 'mkioskty15', 'mkioskty27'],
  // 현재 공식 중증질환 필드에는 중독 전용 항목이 없어 가산점을 적용하지 않는다.
  poisoning: [],
};

const SERIOUS_DISEASE_BONUS = 15;

// 실제 현장 위치 연동 전까지 사용하는 부산 수영구청 인근 임시 기준 좌표다.
const DEFAULT_SCENE_LOCATION = {
  lat: 35.1456,
  lng: 129.1131,
};

function setStatus(message, isError = false) { //setStatus 기능을 새로 만든다 받는값은 message고 에러여부도 확인한다, 값이 붙지 않으면 기본값은 false
  statusEl.textContent = message; //statusEl(병원정보) 내에 받아온 메세지를 옮겨적는다
  statusEl.classList.toggle('status--error', isError); //statusEl 안에 클래스를 추가한다, is error =ture 면 클래스명 status--error 를 달고, false 면 땐다(토글)
}

function getSeriousDiseaseDisplayValue(value) {
  if (value == null || String(value).trim() === '') return '정보미제공';

  const normalizedValue = String(value).trim().toUpperCase();
  if (normalizedValue === 'Y') return '가능';
  if (normalizedValue === 'N') return '불가';
  return '정보미제공';
}

function renderSeriousDiseaseInfo(info) {
  const detailList = Object.entries(info || {})
    .map(([field, value]) => {
      // API 키의 대소문자가 달라도 공식 라벨을 찾을 수 있도록 소문자로 통일한다.
      const label = seriousDiseaseFieldLabels[field.toLowerCase()];
      const displayValue = getSeriousDiseaseDisplayValue(value);
      return { label, displayValue };
    })
    // 카드가 너무 길어지지 않도록 공식 필드 중 Y/N 응답이 있는 항목만 표시한다.
    .filter(({ label, displayValue }) => label && displayValue !== '정보미제공')
    .map(({ label, displayValue }) => (
      `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(displayValue)}</dd>`
    ))
    .join('');

  return `
    <section class="serious-disease-info">
      <strong>중증질환 수용정보</strong>
      ${detailList ? `<dl>${detailList}</dl>` : '<p>제공된 수용정보가 없습니다.</p>'}
    </section>
  `;
}

function renderCard(hospital, reasons = [], scoreInfo = null) { // renderCard 기능(병원하나를 카드로 만드는 함수)을 만들고 받는값은 hospital(병원정보), 이유 값(제외 이유값)은 빈 배열, 병원 점수는 널값을 저장한다(점수 계산 걀과값)
  const li = document.createElement('li'); //li 값을 저장할 공간을 할당 = 문서 내에 li 요소를 추가로 넣는다
  li.className = reasons.length ? 'hospital-card hospital-card--excluded' : 'hospital-card';  // li의 클래스 이름은 hospital-card. 제외 이유가 하나라도 있으면 제외병원 카드를 붙이고 그렇지 않다면 병원 카드를 붙인다
  // 제외 병원은 현재 선택한 환자 유형의 조건을 만족하지 못했으므로 연락 액션을 숨긴다.
  const contactControls = reasons.length ? '' : renderContactControls(hospital); //contactControls 공간할당 = (삼향 연산자)제외이유값을 받았을 때 값이 있으면 아무것도 표시하지 않고, 없으면 hospital 값을 받는 renderContactControls(연락버튼?) 를 실행한다
  const phone = getHospitalPhone(hospital); // phone이라는 공간 할당 hospital값을 getHospitalPhone에 넣어서 결과값을 저장한다
  const distanceKm = getHospitalDistanceKm(hospital);
  const distanceMarkup = distanceKm === null
    ? ''
    : `<dt>거리</dt><dd>약 ${distanceKm.toFixed(1)}km</dd>`;
  const reasonList = reasons //reasonList 공간을 할당, 제외돈 이유값을 저장한다
    .map((reason) => `<li>${escapeHtml(reason)}</li>`) // (map은 배열내의 요소를 하나씩 빼서 조건대로 수정한 뒤 다시 배열에 집에 넣는 코드) 제외 이유를 하나씩 꺼내서 혹시 모를 해킹과 관련된 코드를 읽어오지 않도록 escapeHtml로 감싸서 들고온다
    .join(''); // (.은 앞의 값을 사용하는코드 reasons.join /배열을 다시 문자열로 만들어주는 코드) 위의 맵 결과로 나온 제외 배열을 다시 하나의 문자열로 바꾸기
  const scoreReasonList = scoreInfo?.reasons
    // 실제 총점에 더해진 근거만 보여줘서 추천 이유를 빠르게 읽을 수 있게 한다.
    ?.filter((reason) => typeof reason !== 'string' && Number(reason.points) > 0)
    .map((reason) => (
      `<li><span>${escapeHtml(reason.label)}</span><strong class="score-point">+${reason.points}</strong></li>`
    ))
    .join('');  // 위의 결과로 나온 리스트를 다시 문자열로 바꾼다

  li.innerHTML = ` <!--li 안의 내용을 아래의 내용으로 교체한다 (병원 카드)-->
    <h2>${escapeHtml(hospital.name)}</h2> <!-- 병원의 이름 -->
    ${scoreInfo ? ` <!-- scoreInfo의 내용이 있으면 아래 내용을 보여주고 아니면 아무것도 보여주지 말라-->
      <div class="resource-score">
        <div class="recommendation-score">
          <strong>추천 점수:</strong>
          <span>${scoreInfo.score}점</span>
        </div>
        ${scoreReasonList ? `<div class="recommendation-reasons"><strong>추천 근거:</strong><ul>${scoreReasonList}</ul></div>` : ''}
      </div>
    ` : ''}
    <dl>
      <dt>응급실 연락처</dt>
      <dd>${phone ? `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>` : '-'}</dd> <!--dd,dt,di은 설명값, 삼향 연상자 A ? B: C = A가 있으면 B를 보여주고 없으면 C를 보여준다  escapeHtml는 api에서 이상한 코드가 들어왔을때 문자열로 보여줌으로써 위험도를 낮춘다-->
      <dt>일반 병상</dt>
      <dd>${hospital.generalBeds}석</dd> <!-- api 내의 정보중 generalBeds 만 뽑아서 보여준다-->
      <dt>수술실 병상</dt>
      <dd>${hospital.surgeryBeds}석</dd>
      <dt>총 병상</dt>
      <dd>${hospital.totalBeds}석</dd>
      <dt>중환자 병상</dt>
      <dd>${hospital.icuBeds}석</dd>
      ${distanceMarkup}
    </dl>
    ${renderSeriousDiseaseInfo(hospital.seriousDiseaseInfo)}
    ${hospital.updatedAt ? `<p class="updated">갱신: ${escapeHtml(hospital.updatedAt)}</p>` : ''} <!-- 병원 정보 업데이트 시간이 있다면 클래스가 업데이트인 요소를 넣고 그 안에 갱신: 업데이트 시간을 넣는다 그렇지 않으면 빈칸으로 놔둔다 -->
    ${contactControls} <!-- 제외 이유가 있으면 연락버튼을 지우고 제외이유가 없으면 연락버튼을 넣는다 -->
    ${reasonList ? `<div class="exclude-reasons"><strong>제외 이유</strong><ul>${reasonList}</ul></div>` : ''} <!-- reasonList 값이 있으면 제외이유 문구와 reasonList를 목록화 해서 상자에 감싸서 화면에 표시, 값이 없으면 빈칸-->
  `;
  return li; // li를 결과값으로 도출하고 함수 종료
}

function escapeHtml(text) { //escapeHtml 기능을 만듬 값은 텍스트만 받는다
  const div = document.createElement('div'); //div 공간을 할당하고 = 문서내에 div를 추가로 만든다
  div.textContent = text; //div 내의 텍스트는 = escapeHtml에서 받은 텍스트 값을 넣는다
  return div.innerHTML; //div 내의 값을 문자열로 도출한다 -> 위에서 해킹방지 목적으로 브라우저에서 문자열로 표시해야하기 때문
}

// MVP에서는 환자 정보와 이송 기록을 현재 브라우저의 localStorage에만 저장한다.
// 서버/DB 저장이 아니므로 다른 브라우저나 다른 기기에서는 기록이 공유되지 않는다.
// 기존 사용자의 저장 데이터를 유지하기 위해 localStorage key는 그대로 사용한다.
function readStorageJson(storageKey, fallbackValue) {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || fallbackValue;
  } catch (err) {
    return fallbackValue;
  }
}

function writeStorageJson(storageKey, value) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function loadContactStatuses() { //loadContactStatuses 기능 (연락 기록을 로컬 스토리지에서 꺼내오는 기능)
  return readStorageJson(CONTACT_STORAGE_KEY, {});
}

function saveContactStatuses() { //saveContactStatuses 공간(연락 기록을 로컬 스토리지에 저장하는 기능)
  writeStorageJson(CONTACT_STORAGE_KEY, contactStatusByHospitalId); // 로컬 스토리지에 연락 기록을 문자화 해서 저장한다
}

function loadContactHistory() { // loadContactHistory 공간할당( 연락 이력을 로컬 스토리지에서 들고오는 코드)
  return readStorageJson(CONTACT_HISTORY_STORAGE_KEY, []);
}

function saveContactHistory() {  // saveContactHistory 기능 (연락이력을 로컬스토리지에 저장하는 코드)
  writeStorageJson(CONTACT_HISTORY_STORAGE_KEY, contactHistory);// 로컬 스토리지에 CONTACT_HISTORY_STORAGE_KEY와 연락 이력을 들고와서 문자로 저장한다
}

function loadPatientInfo() {  // loadPatientInfo 기능(환자정보를 로컬스토리지에서 불러오는 기능)
  return readStorageJson(PATIENT_INFO_STORAGE_KEY, {});
}

function savePatientInfo() { // savePatientInfo 기능(환자정보를 로컬 스토리지에 저장하는 기능)
  writeStorageJson(PATIENT_INFO_STORAGE_KEY, patientInfo); // 환자정보를 로컬 스토리지에 문자열로 저장한다
}

function generateTransportCaseId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  // randomUUID를 지원하지 않는 브라우저에서도 새 이송마다 겹치기 어려운 ID를 만든다.
  return `transport-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTransportCase() {
  const acceptedHospitalId = getAcceptedHospitalId() || null;
  const acceptedStatus = acceptedHospitalId
    ? contactStatusByHospitalId[acceptedHospitalId]
    : null;

  return {
    transportCaseId: generateTransportCaseId(),
    createdAt: new Date().toISOString(),
    completedAt: acceptedStatus?.completedAt || null,
    patientInfo: { ...patientInfo },
    contactHistory: contactHistory.map((history) => ({ ...history })),
    acceptedHospitalId,
  };
}

function loadCurrentTransportCase() {
  const savedCase = readStorageJson(CURRENT_TRANSPORT_CASE_STORAGE_KEY, null);
  if (savedCase?.transportCaseId) return savedCase;

  // 처음 구조를 적용한 브라우저는 기존 개별 저장값을 새 케이스의 초기 내용으로 사용한다.
  return createTransportCase();
}

function saveCurrentTransportCase() {
  writeStorageJson(CURRENT_TRANSPORT_CASE_STORAGE_KEY, currentTransportCase);
}

function loadCompletedTransportCases() {
  const savedCases = readStorageJson(COMPLETED_TRANSPORT_CASES_STORAGE_KEY, []);
  return Array.isArray(savedCases) ? savedCases : [];
}

function saveCompletedTransportCases() {
  writeStorageJson(COMPLETED_TRANSPORT_CASES_STORAGE_KEY, completedTransportCases);
}

function saveCurrentCaseToCompletedHistory() {
  const completedCase = {
    ...currentTransportCase,
    patientInfo: { ...currentTransportCase.patientInfo },
    contactHistory: currentTransportCase.contactHistory.map((history) => ({ ...history })),
  };
  const existingIndex = completedTransportCases.findIndex(
    (transportCase) => transportCase.transportCaseId === completedCase.transportCaseId,
  );

  // 같은 이송 건을 다시 저장하면 배열에 중복 추가하지 않고 최신 내용으로 교체한다.
  if (existingIndex >= 0) {
    completedTransportCases[existingIndex] = completedCase;
  } else {
    completedTransportCases.push(completedCase);
  }

  saveCompletedTransportCases();
  debugLog(
    `[이송 완료 저장] transportCaseId: ${completedCase.transportCaseId}`
    + ` (완료 이력 ${completedTransportCases.length}건)`,
  );
  renderCompletedTransportCases();
}

function syncCurrentTransportCase() {
  const acceptedHospitalId = getAcceptedHospitalId() || null;
  const acceptedStatus = acceptedHospitalId
    ? contactStatusByHospitalId[acceptedHospitalId]
    : null;

  currentTransportCase = {
    ...currentTransportCase,
    patientInfo: { ...patientInfo },
    contactHistory: contactHistory.map((history) => ({ ...history })),
    acceptedHospitalId,
    completedAt: acceptedHospitalId
      ? currentTransportCase.completedAt || acceptedStatus?.completedAt || new Date().toISOString()
      : null,
  };
  saveCurrentTransportCase();
}

function clearTransferStorage() {
  localStorage.removeItem(CONTACT_STORAGE_KEY);
  localStorage.removeItem(CONTACT_HISTORY_STORAGE_KEY);
  localStorage.removeItem(PATIENT_INFO_STORAGE_KEY);
  localStorage.removeItem(CURRENT_TRANSPORT_CASE_STORAGE_KEY);
}

// 환자 정보 읽기/저장과 활력징후 검증
function applyPatientInfoToForm() {  // applyPatientInfoToForm 기능( 저장된 환자의 정보를 다시 화면에 표시하는 기능, 만약 환자 정보를 쓰다가 새로고침 되더라도 환자 체크 박스에 마지막에 저장했던 환자의 상태로 자동 체크해줌)
  patientStatusEls.forEach((radioEl) => { //patientStatusEls 내의 환자 라디오 버튼을을 하나씩 가져와서 확인한다
    radioEl.checked = radioEl.value === (patientInfo.patientStatus || 'general'); // radioEl값이 참인지 거짓인지 체크, 라디오 버튼의 value 값이 저장된 환자의 상태값과 같으면 참 저장된 상태가 없으면 기본적으로 general 값을 써라
  }); //-> 선택한 환자의 정보를 새로고침해도 다시 불러와 체크 표시를 유지해주는 코드

  patientInputEls.forEach((inputEl) => { //patientInputEls 환자 입력 정보를 하나씩 가져와서 inputEl이라고 한다
    // 기존 저장 데이터에는 patientCategory가 없을 수 있으므로 해당 선택값만 none을 기본값으로 쓴다.
    const defaultValue = inputEl.name === 'patientCategory' ? 'none' : '';
    inputEl.value = patientInfo[inputEl.name] || defaultValue; // 현재 inputEl 이름과 같은 이름의 값을 patientInfo에서 찾아 입력 폼에 반영한다.
  }); //-> 환자의 정보를 새로고침 해도 다시 불러올 수 있는 코드
}

function readPatientInfoFromForm() { // readPatientInfoFromForm 기능(유저가 작성한 환자 정보 전체를 저장하고 찾는 코드)
  const checkedStatusEl = document.querySelector('input[name="patient-status"]:checked'); //checkedStatusEl 공간할당, name 이 patient-status 인 라디오 버튼중 현재 선택된 요소를 들고온다
  const nextPatientInfo = { // nextPatientInfo 공간할당,
    patientStatus: checkedStatusEl?.value || 'general', //checkedStatusEl값이 있으면 value를, 없으면 general을 patientStatus 값에 저장한다
  };

  patientInputEls.forEach((inputEl) => { // patientInputEls를 각각 하나씩 들고와서 inputEl 라고 한다
    nextPatientInfo[inputEl.name] = inputEl.value.trim(); // 유저가 쓴 inputEl 문자열에서 앞 뒤 스페이스가 들어간 경우 스페이스를 없에고 정리해서 nextPatientInfo 내에 inputEl.name 값으로 저장한다
  });

  return nextPatientInfo; // 유저가 쓴 inputEl.value 환자 한명의 정보 묶음의(혈압, 산소포화도, 호흡수, 체온 등등) 전체 값을 도출한다
}

function validatePatientVitals(patient) {
  const errors = [];
  const invalidFields = new Set();

  Object.entries(vitalSignRules).forEach(([fieldName, rule]) => {
    const value = patient[fieldName];
    if (value === undefined || value === '') return; // 선택 입력이므로 빈 값은 오류가 아니다.

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < rule.min) {
      errors.push(`${rule.label}: 0 이상으로 입력해 주세요.`);
      invalidFields.add(fieldName);
    } else if (numericValue > rule.max) {
      errors.push(`${rule.label}: 최대 ${rule.max}${rule.unit}까지 입력할 수 있습니다.`);
      invalidFields.add(fieldName);
    }

    if (fieldName === 'painScore' && !Number.isInteger(numericValue)) {
      errors.push('통증 수치는 0~10 사이의 정수로 입력해 주세요.');
      invalidFields.add(fieldName);
    }
  });

  const systolicBp = Number(patient.systolicBp);
  const diastolicBp = Number(patient.diastolicBp);
  if (patient.systolicBp && patient.diastolicBp && diastolicBp > systolicBp) {
    errors.push('이완기 혈압은 수축기 혈압보다 클 수 없습니다.');
    invalidFields.add('diastolicBp');
  }

  return { errors, invalidFields };
}

function renderPatientVitalValidation(validation) {
  // 오류가 난 입력칸만 눈에 띄게 표시하고, 사용자가 수정하면 즉시 해제한다.
  Object.keys(vitalSignRules).forEach((fieldName) => {
    const inputEl = document.querySelector(`[name="${fieldName}"]`);
    inputEl?.setAttribute('aria-invalid', String(validation.invalidFields.has(fieldName)));
  });

  patientVitalErrorEl.hidden = validation.errors.length === 0;
  patientVitalErrorEl.textContent = validation.errors.join(' ');
}

function getValidPatientVital(fieldName, invalidFields) {
  if (invalidFields.has(fieldName)) return '';
  return patientInfo[fieldName] == null ? '' : patientInfo[fieldName];
}

function getBloodPressureSummaryItem(invalidFields) {
  const systolicBp = getValidPatientVital('systolicBp', invalidFields);
  const diastolicBp = getValidPatientVital('diastolicBp', invalidFields);

  if (systolicBp && diastolicBp) return ['BP', `${systolicBp}/${diastolicBp} mmHg`];
  if (systolicBp) return ['SBP', `${systolicBp} mmHg`];
  if (diastolicBp) return ['DBP', `${diastolicBp} mmHg`];
  return ['BP', ''];
}

function getPatientSummaryItems() { // getPatientSummaryItems 기능(항목명과 실제 환자의 정보를 매칭하고 요약해주는 코드)
  const { invalidFields } = validatePatientVitals(patientInfo);
  // 잘못 입력된 수치는 안내만 보여주고, 병원 전달 요약에는 정상 범위의 값만 포함한다.
  const validVital = (fieldName) => getValidPatientVital(fieldName, invalidFields);

  return [ // 선택 입력값이 있는 항목만 연락 모달에 표시한다.
    ['환자 구분', patientInfo.patientCategory && patientInfo.patientCategory !== 'none'
      ? patientCategoryLabels[patientInfo.patientCategory] || patientInfo.patientCategory
      : ''],
    ['주증상', patientInfo.chiefComplaint], // 주증상 patientInfo의 chiefComplaint를 불러온다
    ['의식', mentalStatusLabels[patientInfo.mentalStatus] || patientInfo.mentalStatus], // 의식 mentalStatusLabels중에서 patientInfo의 mentalStatus를 불러와 저장 (한글 라벨을 보여주던가 못찾으면 영어 라벨이라도 보여주게 하는 코드 )
    getBloodPressureSummaryItem(invalidFields),
    ['HR', validVital('heartRate') ? `${validVital('heartRate')}/min` : ''],
    ['RR', validVital('respiratoryRate') ? `${validVital('respiratoryRate')}/min` : ''],
    ['SpO2', validVital('spo2') ? `${validVital('spo2')}%` : ''],
    ['BT', validVital('temperature') ? `${validVital('temperature')}℃` : ''],
    ['BST', validVital('bloodSugar') ? `${validVital('bloodSugar')} mg/dL` : ''],
    ['NRS', validVital('painScore') !== '' ? `${validVital('painScore')}/10` : ''],
    ['메모', patientInfo.memo], //메모 patientInfo내의 유저가 직접 작성한memo 표기
  ].filter(([, value]) => value); //환자 정보를 요약하기 위해 뒤의 요소가 있는 배열만 걸러준다(ex 체온(항목명)-> 안중요, 실제 환자의 체온(환자 정보) -> 값이 있을때 들고온다)
}

function handlePatientInfoInput() { //handlePatientInfoInput 기능(받은 환자의 정보, 환자의 정보를 통해 거른 병원 정보를 로컬스토리지에 저장하는 코드)
  // 환자 정보는 현재 브라우저의 이송 건에서만 쓰는 임시 localStorage 데이터다.
  // 나중에 로그인/DB가 붙으면 ambulanceId 또는 transportCaseId 기준 저장으로 바꿔야 한다.
  patientInfo = readPatientInfoFromForm(); //유저가 작성한 환자 정보 전체를 저장하고 찾는 코드를 실행하고 결과 값을 patientInfo에 저장한다
  renderPatientVitalValidation(validatePatientVitals(patientInfo));
  savePatientInfo(); // 환자정보를 로컬 스토리지에 저장하는 기능을 실행한다
  syncCurrentTransportCase();
  if (!contactModalEl.hidden) renderContactModal(); // 열린 모달의 환자 요약도 즉시 갱신한다.
  renderHospitalLists(); //제외병원, 조건 만족 병원을 찾아서 병원을 순서대로 정리하고 유저에게 병원 카드와 정보를 띄워주는 코드
}

function getHospitalId(hospital) { //병원값을 받는 getHospitalId 기능
  return hospital.id; // 병원id를 들고온다
}

function getHospitalPhone(hospital) { // hospital값을 받아오는 getHospitalPhone 기능(병원별 받아온 전화번호의 유무를 확인하고 반환하는 코드)
  return hospital.phone || ''; // 병원의 전화번호가 있으면 값을 주고 없으면 빈칸을 도출
}

function findHospitalName(hospitalId) { // findHospitalName 기능(병원 id를 받아서 저장되어있던 병원배열에서 해당병원을 찾는 코드)
  return hospitalData.find((hospital) => String(getHospitalId(hospital)) === String(hospitalId))?.name || '알 수 없는 병원';// 병원 목록에 저장된 병원들을 하나씩 꺼내서 검사한다, 저장된 병원 아이디와 지금 받아온 병원 id가 같다면 병원이름을 저장하고 그렇지 않으면 해당문구를 출력
}

function getAcceptedHospitalId() { // getAcceptedHospitalId 기능(수락한 병원을 확인하는 코드)
  return Object.keys(contactStatusByHospitalId).find( // contactStatusByHospitalId(병원 연락상태) 객체의 id만 뽑아온다. 조건에 맞는 병원의 id를 들고온다
    (hospitalId) => contactStatusByHospitalId[hospitalId]?.status === 'accepted',//(조건) 상태가 수락인 병원의 id를 들고온다, 없으면 값없을음 출력한다
  );
}

function findHospitalById(hospitalId) { // findHospitalById기능(hospitalData 배열 안에서의 병원 id와  전달받은 id와 동일한 병원을 찾아서 반환한다)
  return hospitalData.find((hospital) => String(getHospitalId(hospital)) === String(hospitalId)) || null; //hospitalData 내의 병원 id값과(문자열) 이 함수에서 받은 id값이 같은지 확인한다
}

function renderContactControls(hospital) { //renderContactControls 기능 만들기, 받는값은 hospital (연락버튼?)
  const hospitalId = getHospitalId(hospital); // hospitalId 공간을 할당, 병원 아이디를 저장한다
  const phone = getHospitalPhone(hospital);// phone 공간을 할당, 병원의 전화번호가 있으면 값을 주고 없으면 빈칸을 도출, 저장한다
  const contactStatus = contactStatusByHospitalId[hospitalId]; // contactStatus공간할당,(현재 병원의 연락상태정보를를 가져온다)  CONTACT_STORAGE_KEY값을 로컬 스토리지 에서 들고오는 함수,값은 hospitalId를 받는다
  const acceptedHospitalId = getAcceptedHospitalId();//acceptedHospitalId 공간할당(수락한 병원을 확인하는 코드)
  // 연락 중 상태는 병원별로 따로 확인하므로 여러 병원에 연속으로 연락할 수 있다.
  const isCallingThisHospital = contactStatus?.status === 'calling';
  const isAccepted = String(acceptedHospitalId) === String(hospitalId); // isAccepted 공간할당 (수락한 병원의 id와  그 병원의 id를 비교해서 동일하면 저장한다)(지금 보고 있는 카드가 수락한 병원이 맞는지 보는 코드)
  const disabledReason = acceptedHospitalId ? '최종 수락 완료' : ''; // 최종 수락 뒤에만 새 연락을 막는다.
  const latestResult = contactStatus && contactStatus.status !== 'calling' // latestResult 공간할당, 현재 병원의 연락상태가 존재하고 그 상태가의 calling 이 아닐때(이미 결과가 끝난 병원연락 결과를 카드에 표시하는 코드)
    ? `<p class="contact-result">최근 결과: ${escapeHtml(contactStatusLabels[contactStatus.status])} <!--클래스가 contact-result인 공간을 만들어서 최근 결과: 병원 연락 결과(객체)를 한글 표시 문구로 바꿔 보여준다 -->
    ${contactStatus.rejectionReason ? ` · ${escapeHtml(contactStatus.rejectionReason)}` : ''}</p>` // 거절했던 병원과 거절한 이유가 있으면  contact-result인 공간에 최근 결과: 병원 거절 이유를 글자 그대로 읽어온다, 없으면 빈칸으로
    : ''; // 연락 결과가 없으면 빈 공간을 넣는다

  if (isCallingThisHospital) { // 만약 isCallingThisHospital 이면 (지금 그리고 있는 이 병원이 현재 연락중인 병원이면 )
    return `
      <div class="contact-panel" data-hospital-id="${escapeHtml(hospitalId)}"> <!-- 클래스가 contact-panel인 상자에 어떤 병원의 hospitalId인지 저장해둔다 -->
        <p class="contact-status">연락 중</p> <!--클래스가 contact-status인 p상자에 연락중 메세지를 출력한다 -->
        <button type="button" data-contact-action="openCalling">연락 결과 기록</button> <!--  이 버튼을 누르면 js가 data-contact-action 값을 보고 연락 결과 기록창을 읽어온다-->
      </div>
    `;
  }

  return `
   <div class="contact-panel" data-hospital-id="${escapeHtml(hospitalId)}"> <!--contact-panel클래스 상자에 병원의 id를 저장해둔다 -->
      ${latestResult} <!-- 병원연락 결과 카드를 저장한다-->
      ${isAccepted ? '' : renderCallControl(phone, disabledReason)} <!-- 병원 연락을 통해 지금 그리고 있는 카드가 수락한 카드가 맞다면 빈칸, 아니라면 renderCallControl 기능(연락 버튼을 사유에 따라 키고 끄는 코드)을 동작시킨다 -->
    </div>
  `;
}

function renderCallControl(phone, disabledReason) { // 전화번호와 연락하기 버튼을 비활성화해야할 사유를 받는 renderCallControl 기능(연락 버튼을 사유에 따라 키고 끄는 코드)
  if (!phone) { // 만약 번호가 존재하지 않는다면
    return '<button type="button" data-contact-action="calling" disabled>전화번호 없음</button>';  // 버튼을 비활성화 하고 그곳에 전화번호 없음을 적어준다
  }

  if (disabledReason) { // 만약 연락하기 버튼을 비활성화해야할 사유가 있다면
    return `<button type="button" data-contact-action="calling" disabled>${escapeHtml(disabledReason)}</button>`; // 버튼을 비활성화 하고 연락하기 버튼을 비활성화해야할 사유를 적어준다
  }

  return '<button type="button" data-contact-action="calling">연락하기</button>'; // 위의 두 상황이 아니라면 연락하기 버튼을 만들어준다
}

function updateContactStatus(hospitalId, nextStatus, extra = {}) { //updateContactStatus 기능 어느병원인지, 변경될 연락 상태, 추가로 저장할 정보 (특정 병원의 연락상태를 바꾸고 변경내용을 로컬스토리지에 저장하는 코드)
  contactStatusByHospitalId[hospitalId] = { // contactStatusByHospitalId 연락 기록을 꺼내온다,
    status: nextStatus,  // 상태는 받아온 nextStatus 값(변경될 연락 상태)
    updatedAt: new Date().toISOString(), // updatedAt에: 연락상태가 업데이트 된 날짜와 시간을 문자열로 바꿔서 저장한다
    ...extra, // 받아온 extra 값을 펼친다 (추가정보가 있으면 같이 저장한다)
  };
  saveContactStatuses(); // 연락기록을 로컬스토리지에 저장한다
}

function addContactHistory(hospitalId, resultStatus, extra = {}) { // addContactHistory 기능 받는 값은 병원id, 연락 결과, 기타정보(거절정보)
  const recordedAt = new Date().toISOString(); // recordedAt 공간 할당, 연락결과가 기록된 현재 날짜와 시간을 문자열로 바꿔서 저장

  // 이 타임라인은 현재 환자 이송 중에만 쓰는 임시 localStorage 기록이다.
  // 나중에 로그인/DB가 붙으면 ambulanceId 또는 transportCaseId 기준으로 저장해야 한다.
  contactHistory.push({ // 연락 이력 배열에 아래 양식대로 추가한다
    id: `${hospitalId}-${recordedAt}`, // id: 아이디-시간
    order: contactHistory.length + 1, // order: 현재 연락 아력 개수에 1을 더한다, 이번 기록의 순번을 작성한다
    hospitalId, // 병원 id
    hospitalName: findHospitalName(hospitalId), //hospitalName: (병원 id를 받아서 저장되어있던 병원배열에서 해당병원을 찾는 코드) -> id를 받아서 병원 이름을 찾는 코드
    resultStatus, //병원 연락 결과
    rejectionReason: extra.rejectionReason || '', // rejectionReason: 거절정보를 저장한다
    recordedAt, // 업뎃 시간
  });
  saveContactHistory(); // 연락이력을 로컬스토리지에 저장
  syncCurrentTransportCase();
}

// 현재 이송 연락 타임라인 렌더링
function formatTimelineTime(value) { //formatTimelineTime 기능 (저장된 시간 값을 한국인이 보기 좋게 바꿔주는 코드 시간만 보여주는 코드)
  if (!value) return '-'; // 만약 value 값이 없다면 -를 반환,
  return new Date(value).toLocaleTimeString('ko-KR', { // 새로받은 value값의 새로운 data객체로 바꾼뒤, 바뀐 데이터를 한국 사람이 보기 편하게 년월일 오후 시 분 으로 바꿔 보여준다
    hour: '2-digit', // 시간은 2자리로 보여줘라
    minute: '2-digit', //  분은 2자리로 보여줘라
  });
}

function normalizeContactHistory() {
  return contactHistory.map((history, index) => ({ // 저장 형식이 오래된 기록도 현재 화면에서 안전하게 표시한다.
    ...history, // 전체 이력 값을 펼친다(기존 이력 객체안에 있던 값을 새 객체안에 복사 저장)
    order: history.order || index + 1,  // order: 기존 이력내에 order값이 있으면 그대로 들고오거나, 없으면 index(배열순서) 값에 1을 더해서 저장한다
    hospitalName: history.hospitalName || findHospitalName(history.hospitalId), // hospitalName: 이력에 병원이름이 이미 있다면 그대로 꺼내오거나, 없다면 병원 id를 통해 병원을 찾아서 저장한다
  }));
}

function findLatestAcceptedHistory(normalizedHistory) {
  return [...normalizedHistory]
    .reverse()
    .find((history) => history.resultStatus === 'accepted');
}

function renderAcceptedHospital(acceptedHistory) {
  if (!acceptedHistory) {
    acceptedHospitalEl.hidden = true;
    acceptedHospitalEl.replaceChildren();
    return;
  }

  acceptedHospitalEl.hidden = false;
  acceptedHospitalEl.innerHTML = `
    <strong>최종 수락 병원:</strong>
    <span>${escapeHtml(acceptedHistory.hospitalName)}</span>
  `;
}

function createContactHistoryItem(history) {
  const li = document.createElement('li');
  li.className = history.resultStatus === 'accepted'
    ? 'contact-history-item contact-history-item--accepted'
    : 'contact-history-item';
  li.innerHTML = `
    <time>${escapeHtml(formatTimelineTime(history.recordedAt))}</time>
    <strong>${escapeHtml(history.hospitalName)}</strong>
    <span>${escapeHtml(contactStatusLabels[history.resultStatus])}</span>
    ${history.rejectionReason ? `<em>${escapeHtml(history.rejectionReason)}</em>` : ''}
  `;
  return li;
}

function renderContactHistory() { //renderContactHistory 기능 (연락 이력을 다시 화면에 그려주는 코드)
  const normalizedHistory = normalizeContactHistory();
  const acceptedHistory = findLatestAcceptedHistory(normalizedHistory);

  renderAcceptedHospital(acceptedHistory);
  contactHistoryListEl.replaceChildren(...normalizedHistory.map(createContactHistoryItem));

  emptyContactHistoryEl.hidden = normalizedHistory.length > 0; //  아직 타임라인이 없을때 표시하는 문구는 연락이력목록이 0보다 클때 숨긴다
}

// 완료 이송 기록: localStorage에 보관된 최근 완료 건을 조회 전용 목록으로 보여준다.
function formatCompletedTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function findCompletedCaseHospitalName(transportCase) {
  const currentHospital = findHospitalById(transportCase.acceptedHospitalId);
  if (currentHospital?.name) return currentHospital.name;

  const acceptedHistory = [...(transportCase.contactHistory || [])]
    .reverse()
    .find((history) => history.resultStatus === 'accepted');
  return acceptedHistory?.hospitalName || '알 수 없는 병원';
}

function createCompletedCaseHistoryMarkup(history) {
  const hospitalName = history.hospitalName
    || findHospitalById(history.hospitalId)?.name
    || '알 수 없는 병원';
  const resultLabel = contactStatusLabels[history.resultStatus] || history.resultStatus || '결과 없음';
  const rejectionText = history.rejectionReason ? `: ${history.rejectionReason}` : '';

  return `
    <li>
      <time>${escapeHtml(formatTimelineTime(history.recordedAt))}</time>
      <span>${escapeHtml(hospitalName)} ${escapeHtml(resultLabel)}${escapeHtml(rejectionText)}</span>
    </li>
  `;
}

function createCompletedCaseItem(transportCase) {
  const li = document.createElement('li');
  const patientCategory = transportCase.patientInfo?.patientCategory || 'none';
  const patientCategoryLabel = patientCategoryLabels[patientCategory] || patientCategoryLabels.none;
  const chiefComplaint = transportCase.patientInfo?.chiefComplaint || '미입력';
  const contactAttempts = Array.isArray(transportCase.contactHistory)
    ? transportCase.contactHistory.length
    : 0;
  const hospitalName = findCompletedCaseHospitalName(transportCase);
  const detailMarkup = (transportCase.contactHistory || [])
    .map(createCompletedCaseHistoryMarkup)
    .join('');

  li.className = 'completed-case-item';
  li.dataset.transportCaseId = transportCase.transportCaseId;
  li.innerHTML = `
    <dl class="completed-case-summary">
      <dt>완료 시간</dt><dd>${escapeHtml(formatCompletedTime(transportCase.completedAt))}</dd>
      <dt>환자 구분</dt><dd>${escapeHtml(patientCategoryLabel)}</dd>
      <dt>주증상</dt><dd>${escapeHtml(chiefComplaint)}</dd>
      <dt>최종 수락 병원</dt><dd>${escapeHtml(hospitalName)}</dd>
      <dt>연락 시도</dt><dd>${contactAttempts}회</dd>
    </dl>
    <button type="button" class="completed-case-toggle" data-completed-case-action="toggle" aria-expanded="false">
      상세 보기
    </button>
    <ol class="completed-case-history" hidden>
      ${detailMarkup || '<li>저장된 연락 이력이 없습니다.</li>'}
    </ol>
  `;
  return li;
}

function renderCompletedTransportCases() {
  const recentCompletedCases = [...completedTransportCases]
    .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
    .slice(0, 5);

  completedCasesListEl.replaceChildren(...recentCompletedCases.map(createCompletedCaseItem));
  emptyCompletedCasesEl.hidden = recentCompletedCases.length > 0;
}

function createContactHistorySummary(historyList) {
  return (historyList || []).map((history) => {
    const hospitalName = history.hospitalName
      || findHospitalById(history.hospitalId)?.name
      || '알 수 없는 병원';
    const resultLabel = contactStatusLabels[history.resultStatus]
      || history.resultStatus
      || '결과 없음';
    const rejectionReason = history.rejectionReason ? `(${history.rejectionReason})` : '';
    return `${hospitalName}: ${resultLabel}${rejectionReason}`;
  }).join(' | ');
}

function escapeCsvValue(value) {
  // 모든 값을 큰따옴표로 감싸면 쉼표, 줄바꿈, 큰따옴표가 포함되어도 한 셀로 안전하게 열린다.
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function createCompletedCasesCsv() {
  const columns = [
    'transportCaseId',
    'createdAt',
    'completedAt',
    'patientCategory',
    'patientStatus',
    'chiefComplaint',
    'mentalStatus',
    'systolic',
    'diastolic',
    'heartRate',
    'respiratoryRate',
    'spo2',
    'temperature',
    'bloodSugar',
    'painScore',
    'acceptedHospitalId',
    'acceptedHospitalName',
    'contactAttemptCount',
    'contactHistorySummary',
    'notes',
  ];
  const rows = completedTransportCases.map((transportCase) => {
    const info = transportCase.patientInfo || {};
    const historyList = Array.isArray(transportCase.contactHistory)
      ? transportCase.contactHistory
      : [];

    return [
      transportCase.transportCaseId,
      transportCase.createdAt,
      transportCase.completedAt,
      info.patientCategory,
      info.patientStatus,
      info.chiefComplaint,
      info.mentalStatus,
      info.systolicBp,
      info.diastolicBp,
      info.heartRate,
      info.respiratoryRate,
      info.spo2,
      info.temperature,
      info.bloodSugar,
      info.painScore,
      transportCase.acceptedHospitalId,
      findCompletedCaseHospitalName(transportCase),
      historyList.length,
      createContactHistorySummary(historyList),
      info.memo,
    ].map(escapeCsvValue).join(',');
  });

  return [columns.map(escapeCsvValue).join(','), ...rows].join('\r\n');
}

function showCompletedCasesExportMessage(message, isError = false) {
  completedCasesExportMessageEl.hidden = false;
  completedCasesExportMessageEl.textContent = message;
  completedCasesExportMessageEl.classList.toggle(
    'completed-cases-export-message--error',
    isError,
  );
}

function formatDownloadDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function exportCompletedTransportCasesCsv() {
  if (!completedTransportCases.length) {
    showCompletedCasesExportMessage('내보낼 완료 이송 기록이 없습니다.', true);
    return;
  }

  const csvText = createCompletedCasesCsv();
  // BOM을 앞에 붙여 Excel 등에서 CSV를 열 때 한글이 깨질 가능성을 줄인다.
  const csvBlob = new Blob([`\uFEFF${csvText}`], { type: 'text/csv;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(csvBlob);
  const downloadLink = document.createElement('a');
  const dateText = formatDownloadDate();

  downloadLink.href = downloadUrl;
  downloadLink.download = `completed-transport-cases-${dateText}.csv`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  showCompletedCasesExportMessage(`${completedTransportCases.length}건의 완료 이송 기록을 내보냈습니다.`);
}

function handleCompletedCaseClick(event) {
  const toggleButton = event.target.closest('[data-completed-case-action="toggle"]');
  if (!toggleButton) return;

  const completedCaseItem = toggleButton.closest('[data-transport-case-id]');
  const detailList = completedCaseItem?.querySelector('.completed-case-history');
  if (!detailList) return;

  const willOpen = detailList.hidden;
  detailList.hidden = !willOpen;
  toggleButton.setAttribute('aria-expanded', String(willOpen));
  toggleButton.textContent = willOpen ? '상세 닫기' : '상세 보기';
}

// 연락 모달 열기/닫기와 연락 결과 저장
function createPatientSummaryMarkup() {
  const summaryItems = getPatientSummaryItems();
  const patientStatusLabel = patientStatusRules[patientInfo.patientStatus || 'general']?.label || '일반 응급';
  const detailMarkup = summaryItems
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join('');

  return `
    <h3>병원 전달용 환자 요약</h3>
    <dl><dt>환자 유형</dt><dd>${escapeHtml(patientStatusLabel)}</dd>${detailMarkup}</dl>
    ${summaryItems.length ? '' : '<p>추가 환자 정보가 아직 입력되지 않았습니다.</p>'}
  `;
}

function createCallAreaMarkup(phone) {
  return phone
    ? `<a class="modal-call-button" href="tel:${escapeHtml(phone)}">전화 연결: ${escapeHtml(phone)}</a>`
    : '<button type="button" disabled>전화번호 없음</button>';
}

function resetContactModalFeedback() {
  modalRejectionReasonEl.value = '';
  modalContactErrorEl.hidden = true;
  modalContactErrorEl.textContent = '';
}

function renderContactModal() { //renderContactModal 기능( 사용자가 연락하기 버튼을 눌렀을때 누른 병원의 정보를 찾아서 (병원명, 환자요약정보,전화버튼, 에러메세지)가 포함된 팝업창을 띄우는 코드 )
  const hospital = findHospitalById(activeModalHospitalId); // hospital 공간할당, (hospitalData 배열 안에서의 병원 id와 전달받은 activeModalHospitalId가 동일한 병원을 찾아서 반환한다)
  if (!hospital) return; // 만약 병원정보가 없으면 아무것도 허ㅏ지 않고 종료

  const phone = getHospitalPhone(hospital); // phone 공간할당 = 병원별 받아온 전화번호의 유무를 확인하고 반환
  contactModalTitleEl.textContent = hospital.name; //contactModalTitleEl(병원 연락 팝업창 제목)내의 텍스트 상자에 받은 병원의 이름값을 넣는 코드
  modalPatientSummaryEl.innerHTML = createPatientSummaryMarkup();
  modalCallAreaEl.innerHTML = createCallAreaMarkup(phone);
  resetContactModalFeedback();
}

function openContactModal(hospitalId) { //openContactModal 기능(방금 사용자가 누른 병원의 id를 확인하는 코드)
  activeModalHospitalId = hospitalId;  // 지금 팝업에서 다를 id를 저장한다
  renderContactModal(); // 사용자가 연락하기 버튼을 눌렀을때 누른 병원의 정보를 찾아서 (병원명, 환자요약정보,전화버튼, 에러메세지)가 포함된 팝업창을 띄우는 코드를 작동한다
  contactModalEl.hidden = false; // 병원 팝업창의 히든 속성을 끈다
}

function closeContactModal({ requireConfirm = true } = {}) { // closeContactModal 기능 닫을때 확인할건지? = true(연락중인 팝업을 닫으면 정말 닫을래? 확인하는 코드 브레이크)
  if ( // &&는 앞부터 이어지는 조건이 모두 참이여야 발동
    requireConfirm && //requireConfirm 이 참인가?
    activeModalHospitalId && // activeModalHospitalId(받은 병원의 id값에 해당하는 병원을 대상으로 팝업창이 열려있는지 저장된 값이 있는가?
    contactStatusByHospitalId[activeModalHospitalId]?.status === 'calling' && // 그 병원이 전화중인 상태인가?
    !window.confirm('연락 결과를 기록하지 않았습니다. 닫으시겠습니까?') // 사용자가 팝업창을 닫지 않는다고 선택을 했다면
  ) {
    return; // 팝업창을 닫지마라
  }

  contactModalEl.hidden = true; // 병원 팝업창의 히든속성을 넣는다
  activeModalHospitalId = null; // 해당하는 병원 을 대상으로 팝업창이 열려있는지 확인 = 널값
}

function handleContactClick(event) { // handleContactClick 기능 (사용자가 클릭한 병원과 연락 결과를 저장하는 코드)
  const actionEl = event.target.closest('[data-contact-action]'); //actionEl 공간할당, 사용자가 클릭한 요소 또는 그 부모 요소중 contact 속성이 붙은 요소를 찾는다
  if (!actionEl || actionEl.disabled) return; // 만약 근처에 없다면 클릭은 비활성화 한다

  const panelEl = actionEl.closest('[data-hospital-id]'); //panelEl 공간할당, actionEl 자신과 그 부모 요소를 포함하여 [data-hospital-id] 속성이 붙은 요소를 찾는다
  const hospitalId = panelEl?.dataset.hospitalId; // hospitalId 공간할당  = panelEl에 정보가 있으면 데이터 내에서 병원 id를 가지고온다, 그렇지 않다면 null(사용자가 어느 병원의 버튼을 눌렀는지 id를 저장하고 )
  const action = actionEl.dataset.contactAction; // action 공간할당 = actionEl에서 사용자가 누른 연락결과를 들고온다(시용자가 어떤 행동 버튼을 눌렀는지 저장)
  if (!hospitalId || !action) return; // 만약 사용자가 id 값이나 연락결과를 받지 못했다면 항수종료

  if (action === 'calling') { // 만약 연락 버튼의 값이 calling일때
    updateContactStatus(hospitalId, 'calling', { startedAt: new Date().toISOString() }); // 해당병원의 연락상태를 calling으로 바꾸고 변경내용을 로컬스토리지에 현재날짜를 기입해서 저장하는 코드)
    openContactModal(hospitalId); // 방금 사용자가 누른 병원의 아이디를 저장하고 그 병원의 연락 팝업창으로 화면에 보여준다
    renderHospitalLists(); //위에서 병원의 연락상태를 변경했다, 새로고침이 필요함 -> 새로 그려주는 코드 (제외병원, 조건 만족 병원을 찾아서 병원을 순서대로 정리하고 유저에게 병원 카드와 정보를 띄워주는 코드)sss
    return; // 여기서 함수 실행을 끝낸다
  }

  if (action === 'openCalling') { // 만약 연락상태가 openCalling이면
    openContactModal(hospitalId); // 방금 사용자가 누른 병원의 아이디를 저장하고 그 병원의 연락 팝업창으로 화면에 보여준다
  }
}

function getRejectionReason(resultStatus) {
  return resultStatus === 'rejected' ? modalRejectionReasonEl.value : '';
}

function showModalContactError(message) {
  modalContactErrorEl.textContent = message;
  modalContactErrorEl.hidden = false;
}

function saveModalContactResult(resultStatus) { //saveModalContactResult 연락 결과 값을 받는 기능 (연락 결과 확정, 상태 저장, 연락이력에 저장, 화면을 다시 그리고,팝업창을 닫는 코드)
  const hospitalId = activeModalHospitalId; //hospitalId 공간할당, 지금 어떤 병원을 대상으로 팝업창이 열려있는지 저장하는 변수를 불러옴,
  if (!hospitalId) return; // 만약 팝업창이 열려있지 않다면 함수종료

  if (resultStatus === 'rejected' && !modalRejectionReasonEl.value) { // 연락 결과가 rejected 이고 거절 결과가 없으면
    showModalContactError('거절 사유를 선택해야 기록할 수 있습니다.');
    return; // 함수종료
  }

  const rejectionReason = getRejectionReason(resultStatus);
  updateContactStatus(hospitalId, resultStatus, { // (특정 병원의 연락상태를 바꾸고 변경내용을 로컬스토리지에 저장하는 코드를 사용한다) 병원id와 , 연락 결과, 거절 사유와 함께 함수에 입력한다
    completedAt: new Date().toISOString(), // 연락 결과가 최종 완료된 시간과 함께 함수에 입력한다
    ...(rejectionReason ? { rejectionReason } : {}), //거절 사유를 펼치고(거절 사유가 있다면 같이 써주고 없으면 저장하지 않는다) 추가로 함수에 입력 -> 굳이 펼치는 이유는 사유가 없을때(수락된 상황)도 굳이 칸을 넣지 않기 위해서
  });
  addContactHistory(hospitalId, resultStatus, { rejectionReason }); // 병원의 id, 연락결과, 거절사유를 로컬스토리지에 저장한다
  if (resultStatus === 'accepted') saveCurrentCaseToCompletedHistory();
  renderContactHistory(); // 연락이력을 화면에 그려준다(타임라인)
  renderHospitalLists(); // 병원 카드를 화면에 그려준다
  closeContactModal({ requireConfirm: false }); // 화면을 닫을전지 확인하는 코드, 연락결과가 이미 기록되었으므로 닫기 확인창 없이 팝업창을 닫는다
}

function resetTransferState() {
  contactStatusByHospitalId = {}; // 연락기록을 초기화 한다
  contactHistory = [];// 연락 이력은 빈 배열을 넣는다
  patientInfo = { patientStatus: 'general', patientCategory: 'none' }; // 새 이송은 환자 유형과 환자 구분을 기본값으로 초기화한다.
  activeModalHospitalId = null; // 선택한 병원의 팝업창이 열려있는지 확인하는 코드, 널 값을 넣는다
}

function renderResetTransferScreen() {
  applyPatientInfoToForm(); // 초기화된 PatientInfo 값을 확자 입력 폼에 다시 반영한다
  renderPatientVitalValidation(validatePatientVitals(patientInfo));
  contactModalEl.hidden = true;  //팝업창을 숨긴다
  renderContactHistory(); // 병원 연락 타임라인을 지운다
  renderHospitalLists();  // 환자 맞춤 병원 카드를 초기화 한다 - 구 내의 병원 목록만 띄운다
}

function startNewTransfer() { // startNewTransfer 공간할당(새로운 이송 버튼을 누르면 화면을 다시 그려주는 코드)
  resetTransferState();
  clearTransferStorage();
  currentTransportCase = createTransportCase();
  saveCurrentTransportCase();
  renderResetTransferScreen();
}

// 자원 여유 점수 계산과 환자 유형별 병원 필터링
function toAvailableCount(value) { // toAvailableCount 기능, value 값을 받는다(병상수를 받아와서 도출함, 숫자가 이상하면 0으로 바꿔준다)
  return Math.max(Number(value) || 0, 0); // 받아온 값이 이상하거나 비어있으면 0을 사용한다, (Math.max는 뒤에 오는 두 숫자중 큰 수를 도출한다)
}

function addResourceScore(scoreInfo, label, count, maxCount, pointPerCount) { //addResourceScore 기능( 병원 추천 점수를 계산하는 코드 ) scoreInfo= 점수 결과를 모아놓는 객체, label= 어떤 자원인지 ex,응급실 병상, count= 실제 병상 갯수, maxCount= 점수로 인정할 최대 갯수, pointPerCount= 1개당 몇점을 줄지
  const score = Math.min(count, maxCount) * pointPerCount; //score 공간 할당, 받아온 count 실제 병상수, maxCount 최대 인정 갯수 값중 작은 값을 골라 pointPerCount 우리가 정해놓은 자원별 점수 값과 곱해서 도출한다(병상수만 비교해서 점수를 주면 병상수만으로만 점수가 높은 병원이 됨, 추천 점수의 신뢰도를 높이기 위함)

  if (score > 0) {  // 만약 score가 0보다 크면
    scoreInfo.score += score; // scoreInfo(총점)안의 score값에다 새로 계산된 점수를 더한다
    scoreInfo.reasons.push({ // scoreInfo안에 들어있는 이유를 배열안에 추가로 밀어넣는다(사용자에게 보여줄 점수 반영 이유)
      label: `${label} 여유 (${count}석)`, // 계산 방식은 유지하고 화면용 근거 문구만 읽기 쉽게 만든다.
      points: score, // points score
    });
    scoreInfo.breakdown.resourceDetails.push({ // 총점내의 점수 계산 상세 내역 을 배열에 추가한다 ex) 응급실 병상 3석 +15점
      label, // 이유
      count, // 실제 병상 수
      points: score, // 이 자원으로 받은 점수
    });
  }
}

function hasAvailableSeriousDiseaseField(seriousDiseaseInfo, matchingFields) {
  if (!seriousDiseaseInfo || typeof seriousDiseaseInfo !== 'object') return false;

  // API 응답 키를 소문자로 맞춰 MKioskTy1, mkioskty1 형식을 모두 같은 방식으로 확인한다.
  const normalizedInfo = Object.fromEntries(
    Object.entries(seriousDiseaseInfo).map(([field, value]) => [field.toLowerCase(), value]),
  );

  return matchingFields.some((field) => (
    String(normalizedInfo[field] ?? '').trim().toUpperCase() === 'Y'
  ));
}

function addSeriousDiseaseBonus(scoreInfo, hospital, patientCategory) {
  const matchingFields = seriousDiseaseFieldsByPatientCategory[patientCategory];
  if (!matchingFields?.length) return; // none, other, 중독 또는 알 수 없는 값은 가산점 대상이 아니다.
  if (!hasAvailableSeriousDiseaseField(hospital?.seriousDiseaseInfo, matchingFields)) return;

  const categoryLabel = patientCategoryLabels[patientCategory];
  scoreInfo.score += SERIOUS_DISEASE_BONUS;
  scoreInfo.reasons.push({
    label: `중증질환 수용 가능: ${categoryLabel}`,
    points: SERIOUS_DISEASE_BONUS,
  });
  scoreInfo.breakdown.specialtyScore = SERIOUS_DISEASE_BONUS;
}

function isValidLocation(location) {
  if (location?.lat === null || location?.lat === undefined || location?.lat === '') return false;
  if (location?.lng === null || location?.lng === undefined || location?.lng === '') return false;

  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180;
}

function calculateDistanceKm(from, to) {
  if (!isValidLocation(from) || !isValidLocation(to)) return null;

  const earthRadiusKm = 6371;
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const fromLat = toRadians(Number(from.lat));
  const toLat = toRadians(Number(to.lat));
  const latitudeDifference = toRadians(Number(to.lat) - Number(from.lat));
  const longitudeDifference = toRadians(Number(to.lng) - Number(from.lng));
  const haversine = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(longitudeDifference / 2) ** 2;
  const safeHaversine = Math.min(Math.max(haversine, 0), 1);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(safeHaversine), Math.sqrt(1 - safeHaversine));
}

function getHospitalDistanceKm(hospital) {
  return calculateDistanceKm(DEFAULT_SCENE_LOCATION, {
    lat: hospital?.latitude,
    lng: hospital?.longitude,
  });
}

function getDistanceScore(distanceKm) {
  if (!Number.isFinite(distanceKm)) return 0;
  if (distanceKm <= 3) return 10;
  if (distanceKm <= 5) return 7;
  if (distanceKm <= 10) return 4;
  return 1;
}

function addDistanceScore(scoreInfo, hospital) {
  const distanceKm = getHospitalDistanceKm(hospital);
  const distanceScore = getDistanceScore(distanceKm);
  scoreInfo.breakdown.distanceScore = distanceScore;

  if (distanceKm === null) {
    debugLog(`[거리 계산 생략] ${hospital?.name || '알 수 없는 병원'}: 좌표 없음`);
    return;
  }

  // 개발 중 실제 API 좌표와 계산 결과를 브라우저 콘솔에서 병원별로 확인한다.
  debugLog('[거리 점수 확인]', {
    hospitalName: hospital?.name || '알 수 없는 병원',
    latitude: hospital?.latitude ?? null,
    longitude: hospital?.longitude ?? null,
    distanceKm: Number(distanceKm.toFixed(1)),
    distanceScore,
  });

  scoreInfo.score += distanceScore;
  scoreInfo.reasons.push({
    label: `거리 가까움: ${distanceKm.toFixed(1)}km`,
    points: distanceScore,
  });
}

function calculateResourceScore(hospital) { // calculateResourceScore  기능(병원 하나의 자원을 확인해 점수를 계산하는 코드)
  const scoreInfo = { //scoreInfo 공간할당
    score: 0, //  기본 점수는 0
    reasons: [], // 이유는 빈칸
    breakdown: {  // 점수 세부 내역
      resourceScore: 0,  // 자원점수는 0부터 시작한다
      resourceDetails: [], // resourceDetails 빈칸
      distanceScore: 0, // 좌표가 없으면 거리 점수는 0점이다.
      specialtyScore: null, // specialtyScore 빈칸
      freshnessScore: null, //  freshnessScore 빈칸
    },
  };

  // 현재 점수는 추천 점수가 아니라 API에 있는 병상/시설 여유만 반영한 resourceScore다.
  addResourceScore(scoreInfo, '응급실 병상', toAvailableCount(hospital.generalBeds), 10, 5); // addResourceScore에 병상별 값을 넣어서 게산한다
  addResourceScore(scoreInfo, '중환자실 병상', toAvailableCount(hospital.icuBeds), 5, 8);
  addResourceScore(scoreInfo, '수술실', toAvailableCount(hospital.surgeryBeds), 5, 7);
  addResourceScore(scoreInfo, '입원실 병상', toAvailableCount(hospital.totalBeds), 20, 2);

  if (hospital.updatedAt) { // 만약 병원 정보 업데이트 시간 값이 있다면,  ---->(나중에 갱신시간값이 30분 이내일때만 점수를 주도록 변경)
    const freshnessPoints = 3; // freshnessPoints 공간할당, 3을 넣어둔다 업데이트시간이 있으면 줄 추가점수
    scoreInfo.score += freshnessPoints; //  총점의 점수에서 3점을 추가로 준다
    scoreInfo.reasons.push({ // 추가점수를 주는 이유를 배열에 추가로 집어넣는다
      label: '갱신 시간 확인됨',
      points: freshnessPoints,
    });
    scoreInfo.breakdown.resourceDetails.push({ // 총점내의 점수 계산 상세내역을 배열에 추가한다
      label: '갱신 시간',
      count: 1, // 갱신시간이 있음 =1 없음 = 0
      points: freshnessPoints,
    });
  } else { // 그렇지 않다면
    scoreInfo.reasons.push({ // 점수를 주지 않고 확인이 필요하다는 메시지를 화면에 띄운다
      label: '갱신 시간 확인 필요',
      points: 0, // 갱신시간 값이 없음
    });
  }

  scoreInfo.breakdown.resourceScore = scoreInfo.score; // 기존 병상과 갱신 시간 점수를 자원 점수로 먼저 확정한다.
  addSeriousDiseaseBonus(scoreInfo, hospital, patientInfo.patientCategory || 'none');
  addDistanceScore(scoreInfo, hospital);

  return scoreInfo; //  게산이 끝난 scoreInfo를 함수 밖으로 돌려준다
}

function getSelectedPatientStatus() { //getSelectedPatientStatus 기능(환자상태를 찾아오거나 만약 없으면 기본값인 general를 보여준다 )
  return patientInfo.patientStatus || 'general'; // patientInfo내의 patientStatus값(환자상태)을 도출하던가 아님 기본값인 general을 도출한다
}

function filterHospitalsByPatientStatus(hospitals, patientStatus) { // hospitals(병원), patientStatus(환자 상태) 값을 받는 filterHospitalsByPatientStatus 기능 (병원의 목록을 하나씩 검사하면서 조건을 만족할 병원/ 제외할 병원을 나눈다, 제외된 이유도 같이 저장ㄴ)
  const rule = patientStatusRules[patientStatus] || patientStatusRules.general; //rule 공간 할당 patientStatusRules(환자 이송 규칙표)안의 환자 상태나 값이 없다면 general 기본값을 저장한다(이송 규칙 덩어리,)

  return hospitals.reduce( //hospitals 배열을 하나씩 돌면서 최종 결과 객체를 만들어서 반환한다  (병원의 목록을 하나씩 검사하면서 조건을 만족할 병원/ 제외할 병원을 나눈다)
    (result, hospital) => { // result(지금까지 검사가 끝난 병원을 모아놓는 바구니), hospital(전체 배열에서 지금 검사중인 병원)
      const availableCount = Number(hospital[rule.field]) || 0; //availableCount 공간할당,  환자별 병원규칙에 따른 필요한 병상수를 병원 정보내에서 들고온다 (현재 환자 유형에 맞는 병상수를 병원정보에서 꺼내고 숫자로 바꾼뒤 값이 없으면 0으로 처리한다)
      const reasons = []; // reasons 공간할당, 빈 배열을 저장한다,(처음엔 검사전이라 빈칸)

      // 현재 단계에서는 질환명이 아니라 API에 있는 가용 자원 숫자만 확인한다.
      if (availableCount < 1) { // 만약 availableCount(가용 침상수)가 1보다 작으면
        reasons.push(rule.reason); // 선택된 환자 유형별 거절 이유를 배열에 새로 집어넣는다

        if (!hospital.updatedAt) { // 만약 병원의 업데이트 시간이 나와있지 않으면,
          reasons.push('데이터 갱신 시간 확인 필요'); // 이유칸에 해당문구 출력
        }
      }

      if (reasons.length) { // 만약 이유가 이미 있으면,
        result.excluded.push({ hospital, reasons }); // 제외한 병원 목록에 현재 병원 정보와 제외된 이유를 같이 넣고 저장한다,
      } else { //  이유가 없다면
        result.matched.push(hospital); // 조건 만족 병원에 해당 병원을 넣는다
      }

      return result; // 검사 끝난 병원을 도출한다
    },
    { matched: [], excluded: [] }, // 처음에 조건만족/ 제외 병원은 빈칸으로 둔다
  );
}

function renderHospitalLists() { // renderHospitalLists 기능(제외병원, 조건 만족 병원을 찾아서 병원을 순서대로 정리하고 유저에게 병원 카드와 정보를 띄워주는 코드 )
  const patientStatus = getSelectedPatientStatus(); //patientStatus 공간할당 (횐자상태를 찾아오거나 만약 없으면 기본값인 general를 보여준다, 선택된 환자별 상태이름표, 음식이름)
  const rule = patientStatusRules[patientStatus] || patientStatusRules.general; // rule 공간할당 patientStatusRules(환자 이송 규칙표)안의 환자 상태 or 없다면 general 기본값을 넣는다 ,위의 이름표를 적용한 규칙 묶음임, 음식의 레시피, 중증 환자는 중환자실 자리를 확인해라
  const { matched, excluded } = filterHospitalsByPatientStatus(hospitalData, patientStatus); // matched, excluded  공간에 각각 제외/ 조건만족 병원을 저장한다 =병원의 목록을 하나씩 검사하면서 조건을 만족할 병원/ 제외할 병원을 나눈다, 제외된 이유도 같이 저장 받는값은 ((hospitalData, patientStatus)
  const regionText = currentRegion ? `${currentRegion.stage1} ${currentRegion.stage2}` : '현재 지역'; //regionText 공간할당 = 현재 지역 정보가 있다면 `${부산광역시} ${수영구}를 표시한다, 없다면 해당문구 출력
  const scoredHospitals = matched // scoredHospitals 공간에는 조건 만족 병원중(병원 점수를 초기화 하고 병원별 점수를 가지고 줄 세우는 코드)
    .map((hospital) => ({ // 조건만족 병원 배열을 하나씩 꺼내 아래내용을 적용
      hospital, // 병원 이름, 점수 정보:
      scoreInfo: calculateResourceScore(hospital), //병원 하나의 자원을 확인해 점수를 계산하는 코드
    }))
    .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score); // 병원별 점수를 비교해서 점수가 높은 병원부터 차레로 표시한다

  listEl.replaceChildren( // 리스트(병원카드 표시하는 공간)내의 기존 병원 카드를 모두 제거하고 다시 만든다 (점수 계산이 끝난 병원 목록을 카드로 만들어서 화면의 병원리스트를 새로 교체하는 코드)
    ...scoredHospitals.map(({ hospital, scoreInfo }) => renderCard(hospital, [], scoreInfo)), // scoredHospitals 배열을 돌면서 각 배열에서{ hospital, scoreInfo } 값을 꺼내온다 ->hospita(병원이름 ), (제외이유)[], scoreInfo(점수)) 모양으로 바꾼다(병원 데이터를 병원 카드 요소로 바꾸는 과정)
  );
  listEl.hidden = matched.length === 0; // 조건 만족 병원이 없다면 병원 카드 표시 공간을 숨긴다

  excludedListEl.replaceChildren( // 제외 병원 카드를 모두 제거하고 다시 만든다
    ...excluded.map(({ hospital, reasons }) => renderCard(hospital, reasons)), // 제외 병원 목록을 돌면서 hospital(병원 정보), reasons (제외 이유) 값을 찾아와 펼쳐놓는다(hospital, reasons) 제외 병원 카드로 만들어 저장한다
  );
  excludedSectionEl.hidden = excluded.length === 0; // 제외 병원이 없다면 제외 병원 카드 표시 공간을 숨긴다

  if (matched.length) { // 만약, 조건 만족 병원이 하나라도 있다면
    setStatus(`${regionText} · ${rule.label} 조건 만족 ${matched.length}곳 · 제외 ${excluded.length}곳`); // setStatus 칸을 통해 유저에게 전달 , {현재 지역} · {환자 상태} 조건만족 {조건 만족 병원 갯수}곳·  제외 {제외병원 갯수} 곳
  } else { // 조건 병원이 한개도 없다면
    setStatus(`${regionText} · ${rule.label} 조건을 만족하는 병원이 없습니다.`); // 해당문구 출력
  }
}

async function loadHospitals() { // 비동기 기능(서버에서 받아온다) loadHospitals
  try { // 일단해봐
    const res = await fetch('/api/hospitals'); // res 공간 할당 = 비동기로 api를 받아온다
    const data = await res.json(); // data 공간할당 = 비동기로 res의 본문을 json형식으로 읽어서 자바스크립트 객체로 바꾼다

    if (!res.ok) { // 만약 서버응답은 왔지만 404 에러와 같이 성공아 아나라면
      throw new Error(data.message || data.error || res.statusText); // 새로운 에러를 던진다 캐치쪽으로(데이터의 메시지 없으면 데이터 에러 없으면 res내의 statusText)
    }

    const { hospitals, region } = data; // 화면에 필요한 병원 목록과 지역 정보만 꺼낸다.

    if (!hospitals.length) {// 만약 배열안에 병원이 없다면(length)= 배열의 길이 배열이 0개면 length도 0
      setStatus(`${region.stage2}에 표시할 병원이 없습니다.`); // 받아온 메세지를 옮겨 적는다 (지역. 수영구)에 표시할 병원이 없다
      listEl.hidden = true;
      excludedSectionEl.hidden = true;
      return; //함수를 도출하고 종료
    }

    hospitalData = hospitals; // api에서 받아온 원본 데이터 저장공간에 받아온 hospitals 값을 저장한다
    currentRegion = region; // 현재 지역명을 저장하는 공간에 받아온 지역값을 저장해둔다
    renderCompletedTransportCases(); // 병원 데이터가 준비되면 완료 기록의 최종 수락 병원명도 다시 확인한다.
    renderHospitalLists();
    statusEl.hidden = false; //statusEl 의 히든 속성을 해제한다
  } catch (err) {// 에러는 이곳으로 받는다
    setStatus(`오류: ${err.message}`, true); // 받아온 메세지를 옮겨 적는다 오류 (에러 내용) , 에러를 true로 바꾼다
    listEl.hidden = true; // listEl의 히든 속성을 true 로 바꾼다
    excludedSectionEl.hidden = true; // 제외병원 칸을 숨긴다
  }
}

// 이벤트 연결과 앱 시작
function registerEventListeners() {
  patientStatusEls.forEach((radioEl) => { // 환자 유형이 바뀌면 저장과 병원 필터링을 함께 갱신한다.
    radioEl.addEventListener('change', handlePatientInfoInput);
  });
  patientInputEls.forEach((inputEl) => { // 선택 환자 정보는 입력 즉시 저장하고 안내 문구를 갱신한다.
    inputEl.addEventListener('input', handlePatientInfoInput);
  });
  listEl.addEventListener('click', handleContactClick);
  excludedListEl.addEventListener('click', handleContactClick);
  completedCasesListEl.addEventListener('click', handleCompletedCaseClick);
  exportCompletedCasesButtonEl.addEventListener('click', exportCompletedTransportCasesCsv);
  newTransferButtonEl.addEventListener('click', startNewTransfer);
  contactModalCloseEl.addEventListener('click', () => closeContactModal());
  contactModalEl.addEventListener('click', (event) => {
    if (event.target === contactModalEl) closeContactModal();
  });
  modalResultButtonEls.forEach((buttonEl) => {
    buttonEl.addEventListener('click', () => saveModalContactResult(buttonEl.dataset.modalResult));
  });
}

function initializeApp() {
  registerEventListeners();
  applyPatientInfoToForm();
  patientInfo = readPatientInfoFromForm();
  // 기존 localStorage 값과 추가된 케이스 저장값을 앱 시작 시 한 번 맞춘다.
  syncCurrentTransportCase();
  renderPatientVitalValidation(validatePatientVitals(patientInfo));
  renderContactHistory();
  renderCompletedTransportCases();
  loadHospitals();
}

initializeApp();
