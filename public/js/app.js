// DOM 요소: 화면에서 자주 사용하는 요소를 시작할 때 한 번만 찾는다.
const DEBUG = false; // 배포 화면에서는 개발 확인용 브라우저 로그를 출력하지 않는다.

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

const statusEl = document.getElementById('status'); // (병원 정보 상태를 나타냄)statusEl 값을 저장할 공간을 할당안다 = html 내의 아이디가 status인 요소를 찾아서 statusEl 이라는 변수애 담는다
const listEl = document.getElementById('hospital-list'); //(병원 카드 list)listEl 값을 저장할 공간을 할당한다 = html 내의 아이디가 hospital-list인 요소를 찾아서 listEl라는 변수에 담는다
const excludedSectionEl = document.getElementById('excluded-section');  // (제외된 병원 전체)excludedSectionEl 공간할당
const excludedListEl = document.getElementById('excluded-list'); // (제외돤 병원 list)excludedListEl 공간할당
const regionStage2El = document.getElementById('region-stage2'); // 부산광역시 안에서 조회할 구·군 선택
const patientFeatureEls = document.querySelectorAll('input[name="patientFeatures"]'); // 환자 특성은 현장에서 여러 개를 함께 표시할 수 있는 체크박스다.
const patientFeatureOtherFieldEl = document.getElementById('patient-feature-other-field'); // 기타 환자 특성을 입력하는 영역
const patientFeatureOtherEl = document.getElementById('patient-feature-other'); // 기타 환자 특성 직접 입력칸
const patientMentalStatusEls = document.querySelectorAll('input[name="mentalStatus"]'); // 의식 상태는 현장에서 바로 고를 수 있는 라디오 묶음이다.
const patientPainScoreEls = document.querySelectorAll('input[name="painScore"]'); // NRS는 0~10 중 하나만 고르는 라디오 묶음이다.
const injuryPartEls = document.querySelectorAll('[data-injury-part]'); // SVG 인체모형에서 클릭 가능한 손상 부위
const selectedInjuryPartsEl = document.getElementById('selected-injury-parts'); // 선택된 손상 부위를 한글로 보여주는 안내 문구
const acceptedHospitalEl = document.getElementById('accepted-hospital'); //(타임라인에 수락한 병원을 보여줌) acceptedHospitalEl 공간할당
const contactHistoryListEl = document.getElementById('contact-history-list'); // (모든 타임라인을 보여줌) contactHistoryListEl 공간할당
const emptyContactHistoryEl = document.getElementById('empty-contact-history');// (아직 타임라인이 없을때 문구를 출력하는 공간 ) emptyContactHistoryEl 공간할당
const newTransferButtonEl = document.getElementById('new-transfer-button'); //(새 이송 시작 버튼) newTransferButtonEl 공간할당
const completedCasesListEl = document.getElementById('completed-cases-list'); // 최근 완료된 이송 기록을 보여줄 목록
const emptyCompletedCasesEl = document.getElementById('empty-completed-cases'); // 완료 기록이 없을 때 보여줄 안내 문구
const exportCompletedCasesButtonEl = document.getElementById('export-completed-cases-button'); // 완료 이송 기록 CSV 다운로드 버튼
const completedCasesExportMessageEl = document.getElementById('completed-cases-export-message'); // 내보내기 결과 안내 문구
const patientInputEls = document.querySelectorAll('[name="chiefComplaint"], [name="systolicBp"], [name="diastolicBp"], [name="heartRate"], [name="respiratoryRate"], [name="spo2"], [name="temperature"], [name="bloodSugar"], [name="memo"]'); // (환자정보 에 관련된 공간) patientInputEls 공간할당
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
const REGION_STORAGE_KEY = 'erHospitalSelectedRegion'; // 지역 선택은 이송 상태와 별도로 저장해 새 이송에도 유지한다.
const DEFAULT_PATIENT_INFO = {
  patientFeatures: [],
  injuryParts: [],
};

const patientFeatureOptions = [ // 현장 사용 빈도 기준 임시 순서다. 실제 피드백을 받으면 이 배열만 조정하면 된다.
  { value: 'fracture', label: '골절' },
  { value: 'trauma', label: '중증외상' },
  { value: 'stroke', label: '뇌경색 의심' },
  { value: 'cardiac', label: '심질환 의심' },
  { value: 'decreasedMental', label: '의식저하' },
  { value: 'pediatric', label: '소아' },
  { value: 'maternity', label: '산모' },
  { value: 'burn', label: '화상' },
  { value: 'amputation', label: '절단' },
  { value: 'other', label: '기타' },
];

const patientFeatureLabels = Object.fromEntries(
  patientFeatureOptions.map(({ value, label }) => [value, label]),
); // 환자 특성 체크박스 저장값을 환자 요약에서 읽기 쉬운 한글로 보여준다.

const injuryPartOptions = [ // SVG 인체모형의 부위 값과 화면 라벨을 한곳에서 관리한다.
  { value: 'head', label: '머리' },
  { value: 'neck', label: '목' },
  { value: 'chest', label: '가슴' },
  { value: 'abdomen', label: '복부' },
  { value: 'pelvis', label: '골반' },
  { value: 'leftShoulder', label: '왼쪽 어깨' },
  { value: 'rightShoulder', label: '오른쪽 어깨' },
  { value: 'leftArm', label: '왼팔' },
  { value: 'rightArm', label: '오른팔' },
  { value: 'leftHand', label: '왼손' },
  { value: 'rightHand', label: '오른손' },
  { value: 'leftLeg', label: '왼다리' },
  { value: 'rightLeg', label: '오른다리' },
  { value: 'leftFoot', label: '왼발' },
  { value: 'rightFoot', label: '오른발' },
];

const injuryPartLabels = Object.fromEntries(
  injuryPartOptions.map(({ value, label }) => [value, label]),
);

// 앱 상태: API 원본 데이터와 현재 이송에서 바뀌는 값을 메모리에 보관한다.
let hospitalData = []; // hospitalData 공간할당 기본값은 빈 배열이고 나중에 API로 받아온 원본 병원 목록을 저장해두고, 선택값이 바뀔 때 다시 필터링한다.
let currentRegion = null;  // 값안에 널값을 저장해둔다(현재 화면에 표시중인 지역을 알려주는 변수, api 값을 받기 전에는 널값을 저장해둔다)
let selectedRegion = loadSelectedRegion();
let contactStatusByHospitalId = loadContactStatuses(); //contactStatusByHospitalId 공간 할당, loadContactStatuses를 실행하고 로컬 스토리지에 저장된 병원별 연락 상태 결과값을 불러와 저장한다(연락 기록을 꺼내온다)
let contactHistory = loadContactHistory(); // loadContactHistory를 실행하고 결과값을 저장한다 ( 연락 이력을 들고오는 코드)
let patientInfo = loadPatientInfo(); // patientInfo 공간을 할당 환자정보를 불러와서 저장한다
let currentTransportCase = loadCurrentTransportCase(); // 기존 개별 저장값과 함께 관리할 현재 이송 케이스
let completedTransportCases = loadCompletedTransportCases(); // 새 이송을 시작해도 유지할 완료 이송 이력
let activeModalHospitalId = null; // activeModalHospitalId 공간할당 널값을 저장해둔다(지금 어떤 병원을 대상으로 팝업창이 열려있는지 저장하는 변수, 처음은 선택을 안했으니 널값)
const expandedHospitalIds = new Set(); // 병원 카드 상세 정보 펼침 상태는 화면 사용 중에만 병원별로 관리한다.

const defaultHospitalFilterRule = {
  // 환자 유형 선택 UI는 제거되었으므로 병원 제외 기준은 응급실 병상 기준 하나로 유지한다.
  label: '일반 응급',
  field: 'generalBeds',
  reason: '응급실 병상 부족',
};

const contactStatusLabels = { //contactStatusLabels 공간할당 각 연락상태별 상태 메시지를 정해놓는다
  calling: '연락 중',
  accepted: '수락',
  rejected: '거절',
  noAnswer: '응답 없음',
};

const mentalStatusLabels = { // 의식 상태의 저장값을 환자 요약에서 사용할 화면 라벨로 바꾼다.
  alert: 'Alert / 명료',
  drowsy: 'Drowsy / 기면',
  stupor: 'Stupor / 혼미',
  semiComa: 'Semi-coma / 반혼수',
  coma: 'Coma / 혼수',
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

const SERIOUS_DISEASE_BONUS = 15;
const SERIOUS_DISEASE_UNAVAILABLE_PENALTY = -8;

const resourceStatusLabels = {
  available: '여유 있음',
  caution: '주의',
  shortage: '부족',
  unknown: '정보 없음',
  unavailable: '불가능',
};

const resourceStatusRules = {
  erBeds: {
    label: '응급실 병상',
    field: 'generalBeds',
    availableMin: 3,
    cautionMin: 1,
    availablePoints: 15,
    cautionPoints: 2,
    shortagePenalty: -10,
  },
  icuBeds: {
    label: '중환자실 병상',
    field: 'icuBeds',
    availableMin: 2,
    cautionMin: 1,
    availablePoints: 12,
    cautionPoints: 2,
    shortagePenalty: -10,
  },
  admissionBeds: {
    label: '입원실 병상',
    field: 'totalBeds',
    availableMin: 5,
    cautionMin: 1,
    availablePoints: 8,
    cautionPoints: 2,
    shortagePenalty: -6,
  },
};

const patientFeatureSeriousDiseaseMatches = {
  stroke: {
    label: patientFeatureLabels.stroke,
    fields: ['mkioskty2', 'mkioskty3', 'mkioskty4', 'mkioskty26', 'mkioskty27'],
  },
  cardiac: {
    label: patientFeatureLabels.cardiac,
    fields: ['mkioskty1', 'mkioskty5', 'mkioskty6'],
  },
  trauma: {
    label: patientFeatureLabels.trauma,
    fields: ['mkioskty20', 'mkioskty21'],
  },
  burn: {
    label: patientFeatureLabels.burn,
    fields: ['mkioskty19'],
  },
  maternity: {
    label: patientFeatureLabels.maternity,
    fields: ['mkioskty16', 'mkioskty17', 'mkioskty18'],
  },
  pediatric: {
    label: patientFeatureLabels.pediatric,
    fields: ['mkioskty10', 'mkioskty12', 'mkioskty14', 'mkioskty15', 'mkioskty27'],
  },
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

function normalizeAvailabilityValue(value) {
  if (value == null || String(value).trim() === '') return 'unknown';

  const normalizedValue = String(value).trim().toUpperCase();
  if (normalizedValue === 'Y') return 'available';
  if (normalizedValue === 'N') return 'unavailable';
  return 'unknown';
}

function normalizeSeriousDiseaseInfo(info) {
  if (!info || typeof info !== 'object') return {};

  return Object.fromEntries(
    Object.entries(info).map(([field, value]) => [field.toLowerCase(), value]),
  );
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

function renderReasonSummary(title, reasons, className = '') {
  const summaryItems = (reasons || []).slice(0, 3);
  if (!summaryItems.length) return '';

  return `
    <div class="reason-summary ${className}">
      <strong>${escapeHtml(title)}</strong>
      <span>${summaryItems.map((reason) => escapeHtml(reason.label || reason)).join(', ')}</span>
    </div>
  `;
}

function renderReasonList(title, reasons, className = '') {
  if (!reasons?.length) return '';

  const listMarkup = reasons.map((reason) => {
    const points = Number(reason.points);
    const pointText = points > 0 ? ` +${points}` : points < 0 ? ` ${points}` : '';
    return `<li>${escapeHtml(reason.label || reason)}${pointText ? `<strong class="score-point ${points < 0 ? 'score-point--negative' : ''}">${escapeHtml(pointText)}</strong>` : ''}</li>`;
  }).join('');

  return `
    <section class="card-detail-section ${className}">
      <strong>${escapeHtml(title)}</strong>
      <ul>${listMarkup}</ul>
    </section>
  `;
}

function renderScoreBreakdown(scoreInfo) {
  const details = Array.isArray(scoreInfo?.breakdown) ? scoreInfo.breakdown : [];
  if (!details.length) return '';

  const listMarkup = details
    .filter((detail) => typeof detail.points === 'number' && detail.points !== 0)
    .map((detail) => {
      const prefix = detail.points > 0 ? '+' : '';
      return `<li>${escapeHtml(detail.label)} <strong class="score-point ${detail.points < 0 ? 'score-point--negative' : ''}">${prefix}${detail.points}</strong></li>`;
    })
    .join('');

  return listMarkup
    ? `<section class="card-detail-section"><strong>점수 산정 근거</strong><ul>${listMarkup}</ul></section>`
    : '';
}

function renderContactHistoryForHospital(hospitalId) {
  const hospitalHistory = normalizeContactHistory()
    .filter((history) => String(history.hospitalId) === String(hospitalId));
  if (!hospitalHistory.length) return '<p>이 병원에 기록된 연락 이력이 없습니다.</p>';

  return `
    <ol class="hospital-contact-history">
      ${hospitalHistory.map((history) => `
        <li>
          <time>${escapeHtml(formatTimelineTime(history.recordedAt || history.createdAt))}</time>
          <span>${escapeHtml(contactStatusLabels[history.resultStatus] || history.result || history.resultStatus || '결과 없음')}</span>
          ${history.rejectionReason ? `<em>${escapeHtml(history.rejectionReason)}</em>` : ''}
        </li>
      `).join('')}
    </ol>
  `;
}

function formatResourceValue(value) {
  return value == null ? '-' : `${escapeHtml(value)}석`;
}

function formatResourceStatus(status) {
  return resourceStatusLabels[status] || resourceStatusLabels.unknown;
}

function createResourceStatusMarkup(value, status) {
  return `${formatResourceValue(value)} <span class="resource-status resource-status--${escapeHtml(status)}">${escapeHtml(formatResourceStatus(status))}</span>`;
}

function renderCard(hospital, reasons = [], scoreInfo = null) { // renderCard 기능(병원하나를 카드로 만드는 함수)을 만들고 받는값은 hospital(병원정보), 이유 값(제외 이유값)은 빈 배열, 병원 점수는 널값을 저장한다(점수 계산 걀과값)
  const li = document.createElement('li'); //li 값을 저장할 공간을 할당 = 문서 내에 li 요소를 추가로 넣는다
  const hospitalId = getHospitalId(hospital);
  const isExpanded = expandedHospitalIds.has(String(hospitalId));
  li.className = reasons.length ? 'hospital-card hospital-card--excluded' : 'hospital-card';  // li의 클래스 이름은 hospital-card. 제외 이유가 하나라도 있으면 제외병원 카드를 붙이고 그렇지 않다면 병원 카드를 붙인다
  li.dataset.hospitalCardId = hospitalId;
  // 제외 병원은 현재 선택한 환자 유형의 조건을 만족하지 못했으므로 연락 액션을 숨긴다.
  const contactControls = reasons.length ? '' : renderContactControls(hospital); //contactControls 공간할당 = (삼향 연산자)제외이유값을 받았을 때 값이 있으면 아무것도 표시하지 않고, 없으면 hospital 값을 받는 renderContactControls(연락버튼?) 를 실행한다
  const phone = getHospitalPhone(hospital); // phone이라는 공간 할당 hospital값을 getHospitalPhone에 넣어서 결과값을 저장한다
  const addressSummary = hospital.address ? String(hospital.address).split(' ').slice(0, 3).join(' ') : '주소 정보 없음';
  const reasonList = reasons //reasonList 공간을 할당, 제외돈 이유값을 저장한다
    .map((reason) => `<li>${escapeHtml(reason)}</li>`) // (map은 배열내의 요소를 하나씩 빼서 조건대로 수정한 뒤 다시 배열에 집에 넣는 코드) 제외 이유를 하나씩 꺼내서 혹시 모를 해킹과 관련된 코드를 읽어오지 않도록 escapeHtml로 감싸서 들고온다
    .join(''); // (.은 앞의 값을 사용하는코드 reasons.join /배열을 다시 문자열로 만들어주는 코드) 위의 맵 결과로 나온 제외 배열을 다시 하나의 문자열로 바꾸기
  const resourceStatuses = scoreInfo?.resourceStatuses || {};
  const recommendationReasons = scoreInfo?.recommendationReasons || scoreInfo?.reasons || [];
  const cautionReasons = scoreInfo?.cautionReasons || [];
  const detailId = `hospital-detail-${String(hospitalId).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  li.innerHTML = ` <!--li 안의 내용을 아래의 내용으로 교체한다 (병원 카드)-->
    <div class="hospital-card-main">
      <h2>${escapeHtml(hospital.name)}</h2> <!-- 병원의 이름 -->
      <p class="hospital-location">${escapeHtml(addressSummary)}</p>
      ${scoreInfo ? ` <!-- scoreInfo의 내용이 있으면 아래 내용을 보여주고 아니면 아무것도 보여주지 말라-->
        <div class="resource-score">
          <div class="recommendation-score">
            <strong>자원 여유 점수:</strong>
            <span>${scoreInfo.totalScore ?? scoreInfo.score}점</span>
          </div>
        </div>
        <div class="reason-summary-panel">
          ${renderReasonSummary('추천 이유', recommendationReasons)}
          ${renderReasonSummary('주의', cautionReasons, 'reason-summary--caution')}
        </div>
      ` : ''}
      ${contactControls} <!-- 제외 이유가 있으면 연락버튼을 지우고 제외이유가 없으면 연락버튼을 넣는다 -->
      ${reasonList ? `<div class="exclude-reasons"><strong>제외 이유</strong><ul>${reasonList}</ul></div>` : ''} <!-- reasonList 값이 있으면 제외이유 문구와 reasonList를 목록화 해서 상자에 감싸서 화면에 표시, 값이 없으면 빈칸-->
      <button type="button" class="hospital-detail-toggle" data-contact-action="toggleDetails" aria-expanded="${isExpanded}" aria-controls="${escapeHtml(detailId)}">
        ${isExpanded ? '상세 접기' : '상세 보기'}
      </button>
    </div>
    <div id="${escapeHtml(detailId)}" class="hospital-card-detail" ${isExpanded ? '' : 'hidden'}>
      <dl>
        <dt>응급실 연락처</dt>
        <dd>${phone ? `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>` : '-'}</dd> <!--dd,dt,di은 설명값, 삼향 연상자 A ? B: C = A가 있으면 B를 보여주고 없으면 C를 보여준다  escapeHtml는 api에서 이상한 코드가 들어왔을때 문자열로 보여줌으로써 위험도를 낮춘다-->
        <dt>일반 병상</dt>
        <dd>${createResourceStatusMarkup(hospital.generalBeds, resourceStatuses.erBeds || 'unknown')}</dd> <!-- api 내의 정보중 generalBeds 만 뽑아서 보여준다-->
        <dt>수술실</dt>
        <dd>${createResourceStatusMarkup(hospital.surgeryBeds, resourceStatuses.surgery || 'unknown')}</dd>
        <dt>입원실 병상</dt>
        <dd>${createResourceStatusMarkup(hospital.totalBeds, resourceStatuses.admissionBeds || 'unknown')}</dd>
        <dt>중환자실 병상</dt>
        <dd>${createResourceStatusMarkup(hospital.icuBeds, resourceStatuses.icuBeds || 'unknown')}</dd>
        <dt>주소</dt>
        <dd>${escapeHtml(hospital.address || '주소 정보 없음')}</dd>
        <dt>데이터 갱신 시간</dt>
        <dd>${escapeHtml(hospital.updatedAt || '정보 없음')}</dd>
      </dl>
      ${renderSeriousDiseaseInfo(hospital.seriousDiseaseInfo)}
      ${renderReasonList('전체 추천 이유', recommendationReasons)}
      ${renderReasonList('전체 주의 이유', cautionReasons, 'card-detail-section--caution')}
      ${renderScoreBreakdown(scoreInfo)}
      <section class="card-detail-section">
        <strong>연락 이력</strong>
        ${renderContactHistoryForHospital(hospitalId)}
      </section>
    </div>
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

function loadSelectedRegion() {
  const savedRegion = readStorageJson(REGION_STORAGE_KEY, null);

  return {
    stage1: '부산광역시',
    stage2: savedRegion?.stage2 || '수영구',
  };
}

function saveSelectedRegion() {
  writeStorageJson(REGION_STORAGE_KEY, selectedRegion);
}

function applySelectedRegionToForm() {
  regionStage2El.value = selectedRegion.stage2;

  // 저장된 값이 현재 선택지에 없으면 안전하게 기본 지역으로 되돌린다.
  if (!regionStage2El.value) {
    selectedRegion = { stage1: '부산광역시', stage2: '수영구' };
    regionStage2El.value = selectedRegion.stage2;
    saveSelectedRegion();
  }
}

function handleRegionChange() {
  selectedRegion = {
    stage1: '부산광역시',
    stage2: regionStage2El.value || '수영구',
  };
  saveSelectedRegion();

  // 지역 변경은 병원 목록만 갱신하며 현재 환자 정보와 연락 타임라인은 유지한다.
  loadHospitals();
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

function normalizePatientInfo(savedInfo = {}) {
  const patientFeatures = Array.isArray(savedInfo.patientFeatures)
    ? savedInfo.patientFeatures.filter((feature) => patientFeatureLabels[feature])
    : [];
  const patientFeatureOther = patientFeatures.includes('other')
    ? String(savedInfo.patientFeatureOther || '').trim()
    : '';
  const injuryParts = Array.isArray(savedInfo.injuryParts)
    ? savedInfo.injuryParts.filter((part) => injuryPartLabels[part])
    : [];

  // 예전 localStorage에 patientStatus/patientSeverity가 남아 있어도 화면 구조에는 사용하지 않고 안전하게 무시한다.
  const {
    patientStatus: _patientStatus,
    patientSeverity: _patientSeverity,
    ...safeInfo
  } = savedInfo;

  return {
    ...safeInfo,
    patientFeatures,
    patientFeatureOther,
    injuryParts,
  };
}

function loadPatientInfo() {  // loadPatientInfo 기능(환자정보를 로컬스토리지에서 불러오는 기능)
  return normalizePatientInfo(readStorageJson(PATIENT_INFO_STORAGE_KEY, {}));
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
  const savedFeatures = Array.isArray(patientInfo.patientFeatures)
    ? patientInfo.patientFeatures
    : DEFAULT_PATIENT_INFO.patientFeatures;
  const savedMentalStatus = patientInfo.mentalStatus == null ? '' : String(patientInfo.mentalStatus);

  patientFeatureEls.forEach((checkboxEl) => {
    checkboxEl.checked = savedFeatures.includes(checkboxEl.value);
  });
  updatePatientFeatureOtherInputVisibility({ clearWhenUnchecked: true });

  patientInputEls.forEach((inputEl) => { //patientInputEls 환자 입력 정보를 하나씩 가져와서 inputEl이라고 한다
    inputEl.value = patientInfo[inputEl.name] || ''; // 현재 inputEl 이름과 같은 이름의 값을 patientInfo에서 찾아 입력 폼에 반영한다.
  }); //-> 환자의 정보를 새로고침 해도 다시 불러올 수 있는 코드

  patientMentalStatusEls.forEach((radioEl) => {
    // 예전 select에서 저장된 mentalStatus 값도 같은 value를 쓰므로 그대로 라디오 선택으로 복원된다.
    radioEl.checked = radioEl.value === savedMentalStatus;
  });

  const savedPainScore = patientInfo.painScore == null ? '' : String(patientInfo.painScore);
  patientPainScoreEls.forEach((radioEl) => {
    // 기존 localStorage에 숫자 입력값으로 저장된 NRS도 같은 patientInfo.painScore 값으로 복원한다.
    radioEl.checked = radioEl.value === savedPainScore;
  });

  renderInjuryPartSelection();
}

function isPatientFeatureOtherChecked() {
  return Array.from(patientFeatureEls).some((checkboxEl) => (
    checkboxEl.value === 'other' && checkboxEl.checked
  ));
}

function updatePatientFeatureOtherInputVisibility({ clearWhenUnchecked = false } = {}) {
  const isOtherChecked = isPatientFeatureOtherChecked();
  if (!patientFeatureOtherFieldEl || !patientFeatureOtherEl) return;

  patientFeatureOtherFieldEl.classList.toggle('patient-feature-option--other-active', isOtherChecked);
  patientFeatureOtherEl.disabled = !isOtherChecked;
  patientFeatureOtherEl.placeholder = isOtherChecked ? '기타 환자 특성' : '기타 선택 시 입력';
  if (!isOtherChecked && clearWhenUnchecked) patientFeatureOtherEl.value = '';
  if (isOtherChecked) {
    patientFeatureOtherEl.value = patientInfo.patientFeatureOther || patientFeatureOtherEl.value;
  }
}

function readSelectedInjuryPartsFromMap() {
  return Array.from(injuryPartEls)
    .filter((partEl) => partEl.dataset.selected === 'true')
    .map((partEl) => partEl.dataset.injuryPart)
    .filter((part) => injuryPartLabels[part]);
}

function formatInjuryParts(parts, emptyText = '없음') {
  const labels = (Array.isArray(parts) ? parts : [])
    .map((part) => injuryPartLabels[part])
    .filter(Boolean);
  return labels.length ? labels.join(', ') : emptyText;
}

function renderInjuryPartSelection() {
  const selectedParts = Array.isArray(patientInfo.injuryParts)
    ? patientInfo.injuryParts
    : DEFAULT_PATIENT_INFO.injuryParts;

  injuryPartEls.forEach((partEl) => {
    const isSelected = selectedParts.includes(partEl.dataset.injuryPart);
    partEl.dataset.selected = String(isSelected);
    partEl.setAttribute('aria-pressed', String(isSelected));
  });

  if (selectedInjuryPartsEl) {
    selectedInjuryPartsEl.textContent = `선택된 손상 부위: ${formatInjuryParts(selectedParts)}`;
  }
}

function readPatientInfoFromForm() { // readPatientInfoFromForm 기능(유저가 작성한 환자 정보 전체를 저장하고 찾는 코드)
  const checkedPainScoreEl = document.querySelector('input[name="painScore"]:checked');
  const checkedMentalStatusEl = document.querySelector('input[name="mentalStatus"]:checked');
  const patientFeatures = Array.from(patientFeatureEls)
    .filter((checkboxEl) => checkboxEl.checked)
    .map((checkboxEl) => checkboxEl.value);
  const patientFeatureOther = patientFeatures.includes('other')
    ? (patientFeatureOtherEl?.value || '').trim()
    : '';
  const nextPatientInfo = { // nextPatientInfo 공간할당,
    patientFeatures,
    patientFeatureOther,
    injuryParts: readSelectedInjuryPartsFromMap(),
    mentalStatus: checkedMentalStatusEl?.value || '',
    painScore: checkedPainScoreEl?.value || '',
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
    const inputEls = document.querySelectorAll(`[name="${fieldName}"]`);
    inputEls.forEach((inputEl) => {
      inputEl.setAttribute('aria-invalid', String(validation.invalidFields.has(fieldName)));
    });
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

function getPatientFeatureLabelList(features) {
  return (Array.isArray(features) ? features : [])
    .map((feature) => patientFeatureLabels[feature])
    .filter(Boolean);
}

function formatPatientFeatures(features, emptyText = '선택 안 함', otherText = '') {
  const labels = getPatientFeatureLabelList(features);
  const hasOther = Array.isArray(features) && features.includes('other');
  if (hasOther && otherText) {
    const otherIndex = labels.indexOf(patientFeatureLabels.other);
    if (otherIndex >= 0) labels[otherIndex] = `${patientFeatureLabels.other} - ${otherText}`;
  }
  return labels.length ? labels.join(', ') : emptyText;
}

function getPatientSummaryItems() { // getPatientSummaryItems 기능(항목명과 실제 환자의 정보를 매칭하고 요약해주는 코드)
  const { invalidFields } = validatePatientVitals(patientInfo);
  // 잘못 입력된 수치는 안내만 보여주고, 병원 전달 요약에는 정상 범위의 값만 포함한다.
  const validVital = (fieldName) => getValidPatientVital(fieldName, invalidFields);

  return [ // 선택 입력값이 있는 항목만 연락 모달에 표시한다.
    ['환자 특성', formatPatientFeatures(patientInfo.patientFeatures, '선택 안 함', patientInfo.patientFeatureOther)],
    ['손상 부위', formatInjuryParts(patientInfo.injuryParts, '')],
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
  renderInjuryPartSelection();
  savePatientInfo(); // 환자정보를 로컬 스토리지에 저장하는 기능을 실행한다
  syncCurrentTransportCase();
  if (!contactModalEl.hidden) renderContactModal(); // 열린 모달의 환자 요약도 즉시 갱신한다.
  renderHospitalLists(); //제외병원, 조건 만족 병원을 찾아서 병원을 순서대로 정리하고 유저에게 병원 카드와 정보를 띄워주는 코드
}

function handlePatientFeatureInput(event) {
  if (event?.target?.value === 'other' && !event.target.checked) {
    updatePatientFeatureOtherInputVisibility({ clearWhenUnchecked: true });
  } else {
    updatePatientFeatureOtherInputVisibility();
  }
  handlePatientInfoInput();
}

function toggleInjuryPart(partEl) {
  const isSelected = partEl.dataset.selected === 'true';
  partEl.dataset.selected = String(!isSelected);
  partEl.setAttribute('aria-pressed', String(!isSelected));
  handlePatientInfoInput();
}

function handleInjuryPartClick(event) {
  const partEl = event.target.closest('[data-injury-part]');
  if (!partEl) return;
  toggleInjuryPart(partEl);
}

function handleInjuryPartKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  toggleInjuryPart(event.currentTarget);
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
  const hospital = findHospitalById(hospitalId);
  const scoreInfoAtContact = hospital ? calculateResourceScore(hospital) : null;
  const recommendationReasonsAtContact = (scoreInfoAtContact?.recommendationReasons || [])
    .map((reason) => ({ ...reason }));
  const cautionReasonsAtContact = (scoreInfoAtContact?.cautionReasons || [])
    .map((reason) => ({ ...reason }));

  // 이 타임라인은 현재 환자 이송 중에만 쓰는 임시 localStorage 기록이다.
  // 나중에 로그인/DB가 붙으면 ambulanceId 또는 transportCaseId 기준으로 저장해야 한다.
  contactHistory.push({ // 연락 이력 배열에 아래 양식대로 추가한다
    id: `${hospitalId}-${recordedAt}`, // id: 아이디-시간
    order: contactHistory.length + 1, // order: 현재 연락 아력 개수에 1을 더한다, 이번 기록의 순번을 작성한다
    hospitalId, // 병원 id
    hospitalName: findHospitalName(hospitalId), //hospitalName: (병원 id를 받아서 저장되어있던 병원배열에서 해당병원을 찾는 코드) -> id를 받아서 병원 이름을 찾는 코드
    result: resultStatus,
    resultStatus, //병원 연락 결과
    rejectionReason: extra.rejectionReason || '', // rejectionReason: 거절정보를 저장한다
    createdAt: recordedAt,
    recordedAt, // 업뎃 시간
    patientFeatures: Array.isArray(patientInfo.patientFeatures) ? [...patientInfo.patientFeatures] : [],
    patientFeatureOther: patientInfo.patientFeatureOther || '',
    injuryParts: Array.isArray(patientInfo.injuryParts) ? [...patientInfo.injuryParts] : [],
    scoreAtContact: scoreInfoAtContact?.totalScore ?? scoreInfoAtContact?.score ?? null,
    recommendationReasonsAtContact,
    cautionReasonsAtContact,
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
    result: history.result || history.resultStatus || '',
    resultStatus: history.resultStatus || history.result || '',
    createdAt: history.createdAt || history.recordedAt || '',
    recordedAt: history.recordedAt || history.createdAt || '',
    patientFeatures: Array.isArray(history.patientFeatures) ? history.patientFeatures : [],
    patientFeatureOther: history.patientFeatureOther || '',
    injuryParts: Array.isArray(history.injuryParts) ? history.injuryParts : [],
    recommendationReasonsAtContact: Array.isArray(history.recommendationReasonsAtContact)
      ? history.recommendationReasonsAtContact
      : [],
    cautionReasonsAtContact: Array.isArray(history.cautionReasonsAtContact)
      ? history.cautionReasonsAtContact
      : [],
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
  const patientFeaturesLabel = formatPatientFeatures(
    transportCase.patientInfo?.patientFeatures,
    '선택 안 함',
    transportCase.patientInfo?.patientFeatureOther,
  );
  const injuryPartsLabel = formatInjuryParts(transportCase.patientInfo?.injuryParts, '선택 안 함');
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
      <dt>환자 특성</dt><dd>${escapeHtml(patientFeaturesLabel)}</dd>
      <dt>손상 부위</dt><dd>${escapeHtml(injuryPartsLabel)}</dd>
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

function countContactHistoryByResult(historyList, resultStatus) {
  return (historyList || []).filter((history) => (
    (history.resultStatus || history.result) === resultStatus
  )).length;
}

function createMainRejectionReasonsSummary(historyList) {
  const reasonCounts = new Map();

  (historyList || []).forEach((history) => {
    if ((history.resultStatus || history.result) !== 'rejected' || !history.rejectionReason) return;
    reasonCounts.set(history.rejectionReason, (reasonCounts.get(history.rejectionReason) || 0) + 1);
  });

  return [...reasonCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${reason} ${count}회`)
    .join(' | ');
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
    'patientFeatures',
    'injuryParts',
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
    'rejectedHospitalCount',
    'noAnswerCount',
    'mainRejectionReasons',
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
      formatPatientFeatures(info.patientFeatures, '', info.patientFeatureOther),
      formatInjuryParts(info.injuryParts, ''),
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
      countContactHistoryByResult(historyList, 'rejected'),
      countContactHistoryByResult(historyList, 'noAnswer'),
      createMainRejectionReasonsSummary(historyList),
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
  const detailMarkup = summaryItems
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join('');

  return `
    <h3>병원 전달용 환자 요약</h3>
    <dl>${detailMarkup}</dl>
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
  const cardEl = actionEl.closest('[data-hospital-card-id]');
  const hospitalId = panelEl?.dataset.hospitalId || cardEl?.dataset.hospitalCardId; // hospitalId 공간할당  = panelEl에 정보가 있으면 데이터 내에서 병원 id를 가지고온다, 그렇지 않다면 null(사용자가 어느 병원의 버튼을 눌렀는지 id를 저장하고 )
  const action = actionEl.dataset.contactAction; // action 공간할당 = actionEl에서 사용자가 누른 연락결과를 들고온다(시용자가 어떤 행동 버튼을 눌렀는지 저장)
  if (!hospitalId || !action) return; // 만약 사용자가 id 값이나 연락결과를 받지 못했다면 항수종료

  if (action === 'toggleDetails') {
    const normalizedHospitalId = String(hospitalId);
    if (expandedHospitalIds.has(normalizedHospitalId)) {
      expandedHospitalIds.delete(normalizedHospitalId);
    } else {
      expandedHospitalIds.add(normalizedHospitalId);
    }
    renderHospitalLists();
    return;
  }

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
  patientInfo = normalizePatientInfo(DEFAULT_PATIENT_INFO); // 새 이송은 환자 특성을 기본값으로 초기화한다.
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
function toResourceCount(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;

  const count = Number(value);
  return Number.isFinite(count) ? count : null;
}

function calculateBedResourceStatus(value, rule) {
  const count = toResourceCount(value);
  if (count === null) return 'unknown';
  if (count >= rule.availableMin) return 'available';
  if (count >= rule.cautionMin) return 'caution';
  return 'shortage';
}

function calculateSurgeryStatus(value) {
  const count = toResourceCount(value);
  if (count === null) return 'unknown';
  return count > 0 ? 'available' : 'unavailable';
}

function calculateResourceStatuses(hospital) {
  return {
    erBeds: calculateBedResourceStatus(hospital.generalBeds, resourceStatusRules.erBeds),
    icuBeds: calculateBedResourceStatus(hospital.icuBeds, resourceStatusRules.icuBeds),
    admissionBeds: calculateBedResourceStatus(hospital.totalBeds, resourceStatusRules.admissionBeds),
    surgery: calculateSurgeryStatus(hospital.surgeryBeds),
  };
}

function addScoreDetail(scoreInfo, detail) {
  scoreInfo.totalScore += detail.points;
  scoreInfo.score = scoreInfo.totalScore; // 기존 렌더링/정렬 코드와의 호환을 위해 같은 값을 유지한다.
  scoreInfo.breakdown.push(detail);
}

function addRecommendationReason(scoreInfo, label, points, type = 'resource') {
  const reason = { label, points };
  scoreInfo.recommendationReasons.push(reason);
  scoreInfo.reasons.push(reason); // 기존 추천 근거 렌더링 코드와 호환한다.
  addScoreDetail(scoreInfo, { type, label, points });
}

function addCautionReason(scoreInfo, label, points = 0, type = 'caution') {
  const reason = { label, points };
  scoreInfo.cautionReasons.push(reason);
  if (points !== 0) addScoreDetail(scoreInfo, { type, label, points });
}

function addCautionScore(scoreInfo, label, points, type = 'caution') {
  // 점수에는 반영하되, 화면의 추천 이유에는 섞이지 않도록 주의 이유에만 담는다.
  const reason = { label, points };
  scoreInfo.cautionReasons.push(reason);
  addScoreDetail(scoreInfo, { type, label, points });
}

function addBedResourceScore(scoreInfo, hospital, statusKey, rule) {
  const count = toResourceCount(hospital[rule.field]);
  const status = scoreInfo.resourceStatuses[statusKey];

  if (status === 'available') {
    addRecommendationReason(scoreInfo, `${rule.label} 여유 있음`, rule.availablePoints, statusKey);
    return;
  }

  if (status === 'caution') {
    addCautionScore(scoreInfo, `${rule.label} ${count}개뿐임`, rule.cautionPoints, statusKey);
    return;
  }

  if (status === 'shortage') {
    addCautionReason(scoreInfo, `${rule.label} 여유 부족`, rule.shortagePenalty, statusKey);
    return;
  }

  addCautionReason(scoreInfo, `${rule.label} 정보 없음`, 0, statusKey);
}

function addSurgeryScore(scoreInfo) {
  const status = scoreInfo.resourceStatuses.surgery;

  if (status === 'available') {
    addRecommendationReason(scoreInfo, '수술실 가능', 6, 'surgery');
    return;
  }

  if (status === 'unavailable') {
    addCautionReason(scoreInfo, '수술실 불가능', -8, 'surgery');
    return;
  }

  addCautionReason(scoreInfo, '수술실 가능 여부 정보 없음', 0, 'surgery');
}

function addPhoneScore(scoreInfo, hospital) {
  if (getHospitalPhone(hospital)) {
    addRecommendationReason(scoreInfo, '전화번호 있음', 3, 'phone');
    return;
  }

  addCautionReason(scoreInfo, '전화번호 정보 없음', 0, 'phone');
}

function getSeriousDiseaseFieldStatus(normalizedInfo, field) {
  return normalizeAvailabilityValue(normalizedInfo[field.toLowerCase()]);
}

function getMatchedSeriousDiseaseLabel(matchingFields, normalizedInfo, targetStatus) {
  return matchingFields
    .map((field) => ({
      field,
      label: seriousDiseaseFieldLabels[field],
      status: getSeriousDiseaseFieldStatus(normalizedInfo, field),
    }))
    .find((item) => item.label && item.status === targetStatus)?.label;
}

function addFeatureSurgeryReason(scoreInfo, featureLabel) {
  const surgeryStatus = scoreInfo.resourceStatuses.surgery;

  if (surgeryStatus === 'available') {
    addRecommendationReason(scoreInfo, `${featureLabel} 관련 수술실 가능`, 0, 'featureResource');
    return;
  }

  if (surgeryStatus === 'unavailable') {
    addCautionReason(scoreInfo, `${featureLabel} 수술실 불가능`, 0, 'featureResource');
    return;
  }

  addCautionReason(scoreInfo, `${featureLabel} 수술실 가능 여부 정보 없음`, 0, 'featureResource');
}

function addFeatureIcuReason(scoreInfo, featureLabel) {
  const icuStatus = scoreInfo.resourceStatuses.icuBeds;

  if (icuStatus === 'available') {
    addRecommendationReason(scoreInfo, `${featureLabel} 관련 중환자실 여유 있음`, 0, 'featureResource');
    return;
  }

  if (icuStatus === 'caution') {
    addCautionReason(scoreInfo, `${featureLabel} 중환자실 1개뿐임`, 0, 'featureResource');
    return;
  }

  if (icuStatus === 'shortage') {
    addCautionReason(scoreInfo, `${featureLabel} 중환자실 여유 부족`, 0, 'featureResource');
    return;
  }

  addCautionReason(scoreInfo, `${featureLabel} 중환자실 정보 없음`, 0, 'featureResource');
}

function addResourceBasedPatientFeatureReason(scoreInfo, feature) {
  if (feature === 'fracture') {
    addFeatureSurgeryReason(scoreInfo, patientFeatureLabels.fracture);
    return true;
  }

  if (feature === 'amputation') {
    addFeatureSurgeryReason(scoreInfo, patientFeatureLabels.amputation);
    return true;
  }

  if (feature === 'decreasedMental') {
    addFeatureIcuReason(scoreInfo, patientFeatureLabels.decreasedMental);
    return true;
  }

  if (feature === 'other') return true;

  return false;
}

function addPatientFeatureSeriousDiseaseScores(scoreInfo, hospital) {
  const selectedFeatures = Array.isArray(patientInfo.patientFeatures)
    ? patientInfo.patientFeatures
    : [];
  const normalizedInfo = normalizeSeriousDiseaseInfo(hospital?.seriousDiseaseInfo);

  selectedFeatures.forEach((feature) => {
    const match = patientFeatureSeriousDiseaseMatches[feature];
    const featureLabel = patientFeatureLabels[feature] || feature;

    if (addResourceBasedPatientFeatureReason(scoreInfo, feature)) return;

    if (!match?.fields?.length) {
      addCautionReason(scoreInfo, `${featureLabel} 관련 수용 정보 없음`, 0, 'seriousDisease');
      return;
    }

    const availableLabel = getMatchedSeriousDiseaseLabel(match.fields, normalizedInfo, 'available');
    if (availableLabel) {
      addRecommendationReason(
        scoreInfo,
        `선택한 환자 특성과 병원 수용 가능 항목 일치: ${match.label}`,
        SERIOUS_DISEASE_BONUS,
        'seriousDisease',
      );
      scoreInfo.breakdown.specialtyMatches.push({
        feature,
        fieldLabel: availableLabel,
        status: 'available',
        points: SERIOUS_DISEASE_BONUS,
      });
      return;
    }

    const unavailableLabel = getMatchedSeriousDiseaseLabel(match.fields, normalizedInfo, 'unavailable');
    if (unavailableLabel) {
      addCautionReason(
        scoreInfo,
        `${match.label} 수용 불가능: ${unavailableLabel}`,
        SERIOUS_DISEASE_UNAVAILABLE_PENALTY,
        'seriousDisease',
      );
      scoreInfo.breakdown.specialtyMatches.push({
        feature,
        fieldLabel: unavailableLabel,
        status: 'unavailable',
        points: SERIOUS_DISEASE_UNAVAILABLE_PENALTY,
      });
      return;
    }

    addCautionReason(scoreInfo, `${match.label} 수용 정보 없음`, 0, 'seriousDisease');
    scoreInfo.breakdown.specialtyMatches.push({
      feature,
      fieldLabel: '',
      status: 'unknown',
      points: 0,
    });
  });
}

function parseHospitalUpdatedAt(updatedAt) {
  if (!updatedAt) return null;

  const value = String(updatedAt).trim();
  // 서버가 정리한 "YYYY-MM-DD HH:mm:ss" 형식은 브라우저별 해석 차이가 없도록 직접 파싱한다.
  const localDateMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/,
  );

  if (localDateMatch) {
    const [, year, month, day, hour, minute, second] = localDateMatch.map(Number);
    const parsedDate = new Date(year, month - 1, day, hour, minute, second);
    const hasSameParts = parsedDate.getFullYear() === year
      && parsedDate.getMonth() === month - 1
      && parsedDate.getDate() === day
      && parsedDate.getHours() === hour
      && parsedDate.getMinutes() === minute
      && parsedDate.getSeconds() === second;

    return hasSameParts ? parsedDate : null;
  }

  // 향후 ISO 형식으로 전달되더라도 유효한 날짜일 때만 점수 계산에 사용한다.
  const parsedTimestamp = Date.parse(value);
  return Number.isFinite(parsedTimestamp) ? new Date(parsedTimestamp) : null;
}

function calculateFreshnessScore(updatedAt, now = new Date()) {
  const updatedDate = parseHospitalUpdatedAt(updatedAt);
  if (!updatedDate) return { points: 0, label: '' };

  const elapsedMinutes = (now.getTime() - updatedDate.getTime()) / (60 * 1000);
  if (!Number.isFinite(elapsedMinutes) || elapsedMinutes < 0) {
    return { points: 0, label: '' };
  }

  if (elapsedMinutes <= 15) return { points: 10, label: '갱신 15분 이내' };
  if (elapsedMinutes <= 30) return { points: 7, label: '갱신 30분 이내' };
  if (elapsedMinutes <= 60) return { points: 4, label: '갱신 60분 이내' };
  if (elapsedMinutes <= 120) return { points: 1, label: '갱신 120분 이내' };
  return { points: 0, label: '' };
}

function addFreshnessScore(scoreInfo, updatedAt) {
  const freshness = calculateFreshnessScore(updatedAt);
  scoreInfo.freshnessScore = freshness.points;

  if (freshness.points > 0) {
    addRecommendationReason(scoreInfo, `데이터 ${freshness.label}`, freshness.points, 'freshness');
    return;
  }

  addCautionReason(scoreInfo, updatedAt ? '데이터 갱신 시간이 오래됨' : '데이터 갱신 시간 정보 없음', 0, 'freshness');
}

function calculateResourceScore(hospital) { // calculateResourceScore  기능(병원 하나의 자원을 확인해 점수를 계산하는 코드)
  const scoreInfo = { //scoreInfo 공간할당
    score: 0, //  기본 점수는 0
    totalScore: 0,
    reasons: [], // 이유는 빈칸
    recommendationReasons: [],
    cautionReasons: [],
    breakdown: [],
    resourceStatuses: calculateResourceStatuses(hospital),
    freshnessScore: 0,
  };
  scoreInfo.breakdown.specialtyMatches = [];

  addPatientFeatureSeriousDiseaseScores(scoreInfo, hospital);
  addBedResourceScore(scoreInfo, hospital, 'erBeds', resourceStatusRules.erBeds);
  addBedResourceScore(scoreInfo, hospital, 'icuBeds', resourceStatusRules.icuBeds);
  addBedResourceScore(scoreInfo, hospital, 'admissionBeds', resourceStatusRules.admissionBeds);
  addSurgeryScore(scoreInfo);
  addFreshnessScore(scoreInfo, hospital.updatedAt);
  addPhoneScore(scoreInfo, hospital);

  return scoreInfo; //  게산이 끝난 scoreInfo를 함수 밖으로 돌려준다
}

function filterHospitalsByDefaultRule(hospitals) { // 병원 목록을 응급실 병상 기준으로 조건 만족/제외 병원으로 나눈다.
  const rule = defaultHospitalFilterRule;
  const statusKeyByField = {
    generalBeds: 'erBeds',
    icuBeds: 'icuBeds',
    totalBeds: 'admissionBeds',
    surgeryBeds: 'surgery',
  };

  return hospitals.reduce( //hospitals 배열을 하나씩 돌면서 최종 결과 객체를 만들어서 반환한다  (병원의 목록을 하나씩 검사하면서 조건을 만족할 병원/ 제외할 병원을 나눈다)
    (result, hospital) => { // result(지금까지 검사가 끝난 병원을 모아놓는 바구니), hospital(전체 배열에서 지금 검사중인 병원)
      const resourceStatuses = calculateResourceStatuses(hospital);
      const selectedResourceStatus = resourceStatuses[statusKeyByField[rule.field]];
      const reasons = []; // reasons 공간할당, 빈 배열을 저장한다,(처음엔 검사전이라 빈칸)

      // 현재 단계에서는 질환명이 아니라 API에 있는 가용 자원 숫자만 확인한다.
      if (selectedResourceStatus === 'shortage' || selectedResourceStatus === 'unavailable') {
        reasons.push(rule.reason); // 선택된 환자 유형별 거절 이유를 배열에 새로 집어넣는다
      } else if (selectedResourceStatus === 'unknown') {
        reasons.push(`${rule.label} 정보 없음`);
      }

      if (!hospital.updatedAt) { // 만약 병원의 업데이트 시간이 나와있지 않으면,
        reasons.push('데이터 갱신 시간 확인 필요'); // 이유칸에 해당문구 출력
      }

      if (selectedResourceStatus === 'shortage' || selectedResourceStatus === 'unavailable') {
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
  const rule = defaultHospitalFilterRule;
  const { matched, excluded } = filterHospitalsByDefaultRule(hospitalData); // matched, excluded 공간에 각각 제외/조건 만족 병원을 저장한다.
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
    setStatus(`${selectedRegion.stage2} 병원 정보를 불러오는 중…`);
    const query = new URLSearchParams(selectedRegion);
    const res = await fetch(`/api/hospitals?${query.toString()}`); // 화면에서 선택한 지역을 서버 조회 조건으로 전달한다.
    const data = await res.json(); // data 공간할당 = 비동기로 res의 본문을 json형식으로 읽어서 자바스크립트 객체로 바꾼다

    if (!res.ok) { // 만약 서버응답은 왔지만 404 에러와 같이 성공아 아나라면
      throw new Error(data.message || data.error || res.statusText); // 새로운 에러를 던진다 캐치쪽으로(데이터의 메시지 없으면 데이터 에러 없으면 res내의 statusText)
    }

    const { hospitals, region } = data; // 화면에 필요한 병원 목록과 지역 정보만 꺼낸다.

    if (!hospitals.length) {// 만약 배열안에 병원이 없다면(length)= 배열의 길이 배열이 0개면 length도 0
      hospitalData = [];
      currentRegion = region;
      setStatus(`${region.stage2}에 표시할 병원이 없습니다.`); // 받아온 메세지를 옮겨 적는다 (지역. 수영구)에 표시할 병원이 없다
      listEl.replaceChildren();
      excludedListEl.replaceChildren();
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
  regionStage2El.addEventListener('change', handleRegionChange);
  injuryPartEls.forEach((partEl) => {
    partEl.addEventListener('click', handleInjuryPartClick);
    partEl.addEventListener('keydown', handleInjuryPartKeydown);
  });
  patientFeatureEls.forEach((checkboxEl) => { // 환자 특성은 여러 개를 선택할 수 있으므로 각 체크박스 변경을 저장한다.
    checkboxEl.addEventListener('change', handlePatientFeatureInput);
  });
  patientFeatureOtherEl?.addEventListener('input', handlePatientInfoInput);
  patientInputEls.forEach((inputEl) => { // 선택 환자 정보는 입력 즉시 저장하고 안내 문구를 갱신한다.
    inputEl.addEventListener('input', handlePatientInfoInput);
  });
  patientMentalStatusEls.forEach((radioEl) => { // 의식 상태 라디오는 선택 변경 시 저장한다.
    radioEl.addEventListener('change', handlePatientInfoInput);
  });
  patientPainScoreEls.forEach((radioEl) => { // NRS 라디오는 선택 변경 시 저장한다.
    radioEl.addEventListener('change', handlePatientInfoInput);
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
  applySelectedRegionToForm();
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
