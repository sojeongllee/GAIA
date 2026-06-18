/* ── State ──────────────────────────────────────────────────────────────── */
let categories       = [];
let scenarios        = [];
let selectedScenario = null;
let selectedOption   = null;
let activeScenario   = null;
let activeOption     = null;
let allResponses     = [];
let allNotes         = {};
let filterPid        = '';
let noteDebounce     = null;

/* ── Socket ─────────────────────────────────────────────────────────────── */
const socket = io({ query: { role: 'host' } });

socket.on('participant-count', n => {
  document.getElementById('participant-count').textContent = n;
});

socket.on('current-state', state => {
  activeScenario = state.scenario;
  activeOption   = state.option;
  refreshActiveInfo();
  refreshOptionCards();
});

socket.on('initial-responses', data => {
  allResponses = data;
  renderLog();
});

socket.on('new-response', r => {
  allResponses.unshift(r);
  renderLog();
});

socket.on('all-notes', notesObj => {
  allNotes = notesObj || {};
  refreshNotesField();
});

socket.on('note-updated', ({ key, text }) => {
  allNotes[key] = text;
  // Update textarea only if this note is currently visible
  if (currentNoteKey() === key) {
    const ta = document.getElementById('notes-textarea');
    if (ta !== document.activeElement) ta.value = text;
  }
});

/* ── Load scenarios ──────────────────────────────────────────────────────── */
fetch('/api/scenarios')
  .then(r => r.json())
  .then(data => {
    categories = data.categories;
    scenarios  = data.scenarios;
    renderScenarioList();
  });

/* ── Scenario list with category groups ─────────────────────────────────── */
function renderScenarioList() {
  const list = document.getElementById('scenario-list');
  list.innerHTML = '';

  categories.forEach(cat => {
    const group = document.createElement('div');
    group.className = 'category-group';

    const label = document.createElement('div');
    label.className = 'category-label';
    label.textContent = cat.title;
    group.appendChild(label);

    const catScenarios = scenarios.filter(s => s.categoryId === cat.id);
    catScenarios.forEach((sc, i) => {
      const globalNum = scenarios.indexOf(sc) + 1;
      const el = document.createElement('div');
      el.className = 'scenario-item';
      el.dataset.id = sc.id;
      el.innerHTML = `<div class="s-num">상황 ${globalNum}</div><div>${sc.title}</div>`;
      el.onclick = () => selectScenario(sc);
      group.appendChild(el);
    });

    list.appendChild(group);
  });
}

/* ── Select scenario ─────────────────────────────────────────────────────── */
function selectScenario(sc) {
  selectedScenario = sc;
  selectedOption   = null;

  document.querySelectorAll('.scenario-item').forEach(el =>
    el.classList.toggle('selected', el.dataset.id === sc.id)
  );

  document.getElementById('btn-show').disabled = true;
  renderOptionCards();
  refreshNotesField();
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
      <div class="opt-badges">
        <span class="opt-type">${opt.type}</span>
        <span class="opt-active-badge">▶ 현재 표시 중</span>
        <button class="opt-preview-btn" onclick="openPreview(event,'${opt.id}')">👁 미리보기</button>
      </div>
    `;
    card.onclick = (e) => {
      if (e.target.classList.contains('opt-preview-btn')) return;
      selectOption(opt, card);
    };
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
  refreshNotesField();
}

/* ── Show to participant ─────────────────────────────────────────────────── */
function showToParticipant() {
  if (!selectedScenario || !selectedOption) return;
  socket.emit('show-ui', {
    scenarioId: selectedScenario.id,
    optionId:   selectedOption.id,
    scenario:   selectedScenario,
    option:     selectedOption
  });
}

/* ── Reset ───────────────────────────────────────────────────────────────── */
function resetParticipant() { socket.emit('reset'); }

/* ── Active info bar ─────────────────────────────────────────────────────── */
function refreshActiveInfo() {
  const bar   = document.getElementById('active-info');
  const badge = document.getElementById('active-badge');
  if (activeScenario && activeOption) {
    bar.textContent = `▶ 현재 표시 중: [${activeScenario.title}] — ${activeOption.title}`;
    bar.classList.add('visible');
    badge.textContent = '표시 중';
    badge.classList.add('active');
  } else {
    bar.classList.remove('visible');
    badge.textContent = '대기 중';
    badge.classList.remove('active');
  }
}

/* ── Notes ───────────────────────────────────────────────────────────────── */
function currentNoteKey() {
  if (!selectedScenario) return null;
  return selectedOption
    ? `${selectedScenario.id}:${selectedOption.id}`
    : selectedScenario.id;
}

function refreshNotesField() {
  const ta  = document.getElementById('notes-textarea');
  const ctx = document.getElementById('notes-context');
  const key = currentNoteKey();

  if (!key) {
    ta.disabled = true;
    ta.value = '';
    ctx.textContent = '';
    return;
  }

  ta.disabled = false;
  ta.value = allNotes[key] || '';
  ctx.textContent = selectedOption
    ? `— ${selectedScenario.title} › ${selectedOption.title}`
    : `— ${selectedScenario.title}`;
}

function onNoteInput() {
  const key = currentNoteKey();
  if (!key) return;
  const text = document.getElementById('notes-textarea').value;
  allNotes[key] = text;

  clearTimeout(noteDebounce);
  noteDebounce = setTimeout(() => {
    socket.emit('update-note', { key, text });
  }, 400);
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
    const ts = new Date(r.timestamp).toLocaleTimeString('ko-KR');
    const helpClass = r.helpfulness === '도움됨'    ? 'helpful'
                    : r.helpfulness === '도움 안 됨' ? 'unhelpful'
                    : 'neutral';
    const entry = document.createElement('div');
    entry.className = 'response-entry';
    entry.innerHTML = `
      <div class="r-header">
        <span class="r-pid">${r.participantId}</span>
        <span>${ts}</span>
      </div>
      <div class="r-scenario">${r.scenarioTitle}</div>
      <div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.2rem">${r.optionTitle}</div>
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

/* ── Preview modal ───────────────────────────────────────────────────────── */
function openPreview(event, optionId) {
  event.stopPropagation();
  if (!selectedScenario) return;

  const opt = selectedScenario.options.find(o => o.id === optionId);
  if (!opt) return;

  document.getElementById('preview-title').textContent = opt.title;
  document.getElementById('preview-type-badge').textContent = opt.type;
  document.getElementById('preview-ui-content').innerHTML = buildPreviewUI(opt);
  document.getElementById('preview-modal').classList.add('open');
}

function closePreviewBtn() {
  document.getElementById('preview-modal').classList.remove('open');
}

function closePreview(e) {
  if (e.target === document.getElementById('preview-modal')) closePreviewBtn();
}

function buildPreviewUI(opt) {
  const c = opt.content;
  switch (opt.type) {
    case 'popup':
      return `
        <div class="pv-popup">
          <div class="pv-icon">${c.icon ?? '💡'}</div>
          <div class="pv-heading">${c.heading}</div>
          <div class="pv-body">${c.body}</div>
        </div>`;

    case 'sidepanel':
      const sections = c.sections.map(s =>
        `<div class="pv-sp-section">
           <div class="pv-sp-title">${s.title}</div>
           <div class="pv-sp-body">${s.body}</div>
         </div>`
      ).join('');
      return `
        <div class="pv-sidepanel">
          <div class="pv-heading">${c.heading}</div>
          ${sections}
        </div>`;

    case 'hud-checklist':
      const items = c.items.map(t =>
        `<div class="pv-hud-item"><div class="pv-hud-cb"></div><span>${t}</span></div>`
      ).join('');
      return `
        <div class="pv-hud">
          <div class="pv-heading">${c.heading}</div>
          ${items}
        </div>
        <div class="preview-minimap">🗺️</div>`;

    case 'minimap':
      const arrowMap = {
        north:'⬆️', northeast:'↗️', east:'➡️', southeast:'↘️',
        south:'⬇️', southwest:'↙️', west:'⬅️', northwest:'↖️'
      };
      return `
        <div class="pv-minimap">
          <div class="pv-label">${c.heading}</div>
          <div class="pv-arrow">${arrowMap[c.direction] ?? '➡️'}</div>
          <div class="pv-label">${c.description}</div>
          <div class="pv-dist">${c.distance}</div>
        </div>
        <div class="preview-minimap">🗺️</div>`;

    case 'stepbystep':
      const steps = c.steps.map((t, i) =>
        `<div class="pv-step-item">
           <div class="pv-step-num">${i + 1}</div>
           <span>${t}</span>
         </div>`
      ).join('');
      return `
        <div class="pv-steps">
          <div class="pv-heading">${c.heading}</div>
          ${steps}
        </div>`;

    case 'ai-buttons':
      const btns = c.buttons.map(b =>
        `<div class="pv-aib-btn">${b.label}</div>`
      ).join('');
      return `
        <div class="pv-aib">
          <div class="pv-heading">${c.heading}</div>
          <div class="pv-desc">${c.description}</div>
          <div class="pv-aib-grid">${btns}</div>
        </div>`;

    default:
      return `<div style="color:#fff;padding:2rem">알 수 없는 UI 유형: ${opt.type}</div>`;
  }
}

/* ── Export ──────────────────────────────────────────────────────────────── */
function exportResponsesCSV()  { window.location.href = '/export/responses-csv'; }
function exportResponsesJSON() { window.location.href = '/export/responses-json'; }
function exportEventsJSON()    { window.location.href = '/export/events-json'; }
