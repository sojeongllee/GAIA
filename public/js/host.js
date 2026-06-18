/* ── State ──────────────────────────────────────────────────────────────── */
let scenarios       = [];
let selectedScenario = null;
let selectedOption   = null;
let activeScenario   = null;   // currently shown to participants
let activeOption     = null;
let allResponses     = [];
let filterPid        = '';

/* ── Socket ─────────────────────────────────────────────────────────────── */
const socket = io({ query: { role: 'host' } });

socket.on('participant-count', (n) => {
  document.getElementById('participant-count').textContent = n;
});

socket.on('current-state', (state) => {
  activeScenario = state.scenario;
  activeOption   = state.option;
  refreshActiveInfo();
  refreshOptionCards();
});

socket.on('initial-responses', (data) => {
  allResponses = data;
  renderLog();
});

socket.on('new-response', (r) => {
  allResponses.unshift(r);
  renderLog();
});

/* ── Load scenarios ──────────────────────────────────────────────────────── */
fetch('/api/scenarios')
  .then(r => r.json())
  .then(data => {
    scenarios = data;
    renderScenarioList();
  });

/* ── Render scenario list ────────────────────────────────────────────────── */
function renderScenarioList() {
  const list = document.getElementById('scenario-list');
  list.innerHTML = '';

  scenarios.forEach((sc, i) => {
    const el = document.createElement('div');
    el.className = 'scenario-item';
    el.dataset.id = sc.id;
    el.innerHTML = `
      <div class="s-number">시나리오 ${i + 1}</div>
      <div>${sc.title}</div>
    `;
    el.onclick = () => selectScenario(sc);
    list.appendChild(el);
  });
}

/* ── Select scenario ─────────────────────────────────────────────────────── */
function selectScenario(sc) {
  selectedScenario = sc;
  selectedOption   = null;

  document.querySelectorAll('.scenario-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === sc.id);
  });

  document.getElementById('btn-show').disabled = true;
  renderOptionCards();
}

/* ── Render option cards ─────────────────────────────────────────────────── */
function renderOptionCards() {
  const list = document.getElementById('option-list');
  if (!selectedScenario) {
    list.innerHTML = '<p class="option-placeholder">← 왼쪽에서 시나리오를 선택하세요</p>';
    return;
  }

  list.innerHTML = '';
  selectedScenario.options.forEach(opt => {
    const isActive = activeOption && activeOption.id === opt.id
                  && activeScenario && activeScenario.id === selectedScenario.id;
    const card = document.createElement('div');
    card.className = 'option-card' + (isActive ? ' active-shown' : '');
    card.dataset.id = opt.id;
    card.innerHTML = `
      <div class="opt-title">${opt.title}</div>
      <span class="opt-type">${opt.type}</span>
      <div class="opt-active-badge">▶ 현재 표시 중</div>
    `;
    card.onclick = () => selectOption(opt, card);
    list.appendChild(card);
  });
}

function refreshOptionCards() {
  if (selectedScenario) renderOptionCards();
}

/* ── Select option ───────────────────────────────────────────────────────── */
function selectOption(opt, card) {
  selectedOption = opt;
  document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
  card.classList.add('selected');
  document.getElementById('btn-show').disabled = false;
}

/* ── Show to participant ─────────────────────────────────────────────────── */
function showToParticipant() {
  if (!selectedScenario || !selectedOption) return;

  socket.emit('show-ui', {
    scenarioId:    selectedScenario.id,
    optionId:      selectedOption.id,
    scenario:      selectedScenario,
    option:        selectedOption
  });
}

/* ── Reset ───────────────────────────────────────────────────────────────── */
function resetParticipant() {
  socket.emit('reset');
}

/* ── Active info bar ─────────────────────────────────────────────────────── */
function refreshActiveInfo() {
  const bar   = document.getElementById('active-info');
  const badge = document.getElementById('active-badge');

  if (activeScenario && activeOption) {
    bar.textContent = `▶ 현재 표시 중: [${activeScenario.shortTitle}] — ${activeOption.title}`;
    bar.classList.add('visible');
    badge.textContent = '표시 중';
    badge.classList.add('active');
  } else {
    bar.classList.remove('visible');
    badge.textContent = '대기 중';
    badge.classList.remove('active');
  }
}

/* ── Response log ────────────────────────────────────────────────────────── */
function filterLog() {
  filterPid = document.getElementById('log-filter').value.trim().toLowerCase();
  renderLog();
}

function renderLog() {
  const container = document.getElementById('log-entries');
  const visible = filterPid
    ? allResponses.filter(r => r.participantId.toLowerCase().includes(filterPid))
    : allResponses;

  if (visible.length === 0) {
    container.innerHTML = '<p class="log-empty">응답 없음</p>';
    return;
  }

  container.innerHTML = '';
  visible.forEach(r => {
    const entry = document.createElement('div');
    entry.className = 'response-entry';

    const ts = new Date(r.timestamp).toLocaleTimeString('ko-KR');
    const helpClass = r.helpfulness === '도움됨'   ? 'helpful'
                    : r.helpfulness === '도움 안 됨' ? 'unhelpful'
                    : 'neutral';

    entry.innerHTML = `
      <div class="r-header">
        <span class="r-pid">${r.participantId}</span>
        <span>${ts}</span>
      </div>
      <div class="r-scenario">${r.scenarioTitle}</div>
      <div style="font-size:0.82rem;color:var(--muted)">${r.optionTitle}</div>
      <div class="r-chips">
        <span class="chip ${helpClass}">${r.helpfulness ?? '-'}</span>
        <span class="chip">${r.interventionLevel ?? '-'}</span>
        <span class="chip">${r.activationMode ?? '-'}</span>
        ${r.detailRequest ? `<span class="chip">${r.detailRequest}</span>` : ''}
      </div>
      ${r.comment ? `<div class="r-comment">"${r.comment}"</div>` : ''}
    `;
    container.appendChild(entry);
  });
}

/* ── Export ──────────────────────────────────────────────────────────────── */
function exportJSON() { window.location.href = '/export/json'; }
function exportCSV()  { window.location.href = '/export/csv'; }
