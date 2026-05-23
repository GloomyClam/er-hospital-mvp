const statusEl = document.getElementById('status');
const listEl = document.getElementById('hospital-list');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('status--error', isError);
}

function renderCard(hospital) {
  const li = document.createElement('li');
  li.className = 'hospital-card';
  li.innerHTML = `
    <h2>${escapeHtml(hospital.name)}</h2>
    <dl>
      <dt>응급실 연락처</dt>
      <dd>${hospital.phone ? `<a href="tel:${escapeHtml(hospital.phone)}">${escapeHtml(hospital.phone)}</a>` : '-'}</dd>
      <dt>일반 병상</dt>
      <dd>${hospital.generalBeds}석</dd>
      <dt>수술실 병상</dt>
      <dd>${hospital.surgeryBeds}석</dd>
      <dt>응급실 총 병상</dt>
      <dd>${hospital.totalBeds}석</dd>
      <dt>중환자 병상</dt>
      <dd>${hospital.icuBeds}석</dd>
    </dl>
    ${hospital.updatedAt ? `<p class="updated">갱신: ${escapeHtml(hospital.updatedAt)}</p>` : ''}
  `;
  return li;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadHospitals() {
  try {
    const res = await fetch('/api/hospitals');
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || res.statusText);
    }

    const { hospitals, region, totalCount } = data;

    if (!hospitals.length) {
      setStatus(`${region.stage2}에 표시할 병원이 없습니다.`);
      return;
    }

    listEl.replaceChildren(...hospitals.map(renderCard));
    listEl.hidden = false;
    setStatus(`${region.stage1} ${region.stage2} · ${totalCount}곳`);
    statusEl.hidden = false;
  } catch (err) {
    setStatus(`오류: ${err.message}`, true);
    listEl.hidden = true;
  }
}

loadHospitals();
