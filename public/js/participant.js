/* ── Participant ID ─────────────────────────────────────────────────────── */
const params = new URLSearchParams(window.location.search);
const pid    = params.get('pid') || 'P?';
document.getElementById('pid-label').textContent = pid;

/* ── Response state ─────────────────────────────────────────────────────── */
let currentScenario   = null;
let currentOption     = null;
let selections        = {};    // { helpfulness, interventionLevel, activationMode }
let lastDetailRequest = null;

/* ── Socket ─────────────────────────────────────────────────────────────── */
const socket = io({ query: { role: 'participant', pid } });

socket.on('show-ui', ({ scenario, option }) => {
  currentScenario   = scenario;
  currentOption     = option;
  lastDetailRequest = null;
  selections        = {};

  document.getElementById('waiting-screen').style.display  = 'none';
  document.getElementById('submitted-msg').style.display   = 'none';
  document.getElementById('response-panel').classList.remove('visible');
  resetFormButtons();

  renderUI(option);

  // Show response panel after a short moment so participant sees the UI first
  setTimeout(() => {
    document.getElementById('response-panel').classList.add('visible');
  }, 600);
});

socket.on('reset', () => {
  currentScenario   = null;
  currentOption     = null;
  lastDetailRequest = null;
  selections        = {};

  document.getElementById('ui-overlay').innerHTML      = '';
  document.getElementById('waiting-screen').style.display = 'flex';
  document.getElementById('response-panel').classList.remove('visible');
  document.getElementById('submitted-msg').style.display  = 'none';
});

/* ── Render AI UI overlay ────────────────────────────────────────────────── */
function renderUI(option) {
  const overlay = document.getElementById('ui-overlay');
  overlay.innerHTML = '';

  switch (option.type) {
    case 'popup':         overlay.appendChild(buildPopup(option.content));        break;
    case 'sidepanel':     overlay.appendChild(buildSidePanel(option.content));    break;
    case 'hud-checklist': overlay.appendChild(buildHudChecklist(option.content)); break;
    case 'minimap':       overlay.appendChild(buildMinimap(option.content));      break;
    case 'stepbystep':    overlay.appendChild(buildStepByStep(option.content));   break;
    case 'ai-buttons':    overlay.appendChild(buildAiButtons(option.content));    break;
    default:
      overlay.innerHTML = `<div style="color:#fff;padding:2rem;">알 수 없는 UI 유형: ${option.type}</div>`;
  }
}

/* ── UI builders ─────────────────────────────────────────────────────────── */

function buildPopup(c) {
  const el = document.createElement('div');
  el.className = 'ui-popup';
  el.innerHTML = `
    <div class="pop-icon">${c.icon ?? '💡'}</div>
    <div class="pop-heading">${c.heading}</div>
    <div class="pop-body">${c.body}</div>
  `;
  return el;
}

function buildSidePanel(c) {
  const el = document.createElement('div');
  el.className = 'ui-sidepanel';
  const sections = c.sections.map(s =>
    `<div class="sp-section">
      <div class="sp-title">${s.title}</div>
      <div class="sp-body">${s.body}</div>
    </div>`
  ).join('');
  el.innerHTML = `<div class="panel-heading">${c.heading}</div>${sections}`;
  return el;
}

function buildHudChecklist(c) {
  const el = document.createElement('div');
  el.className = 'ui-hud-checklist';
  const items = c.items.map((text, i) =>
    `<div class="hud-item" onclick="toggleHudItem(this)" data-index="${i}">
      <div class="hud-checkbox">✓</div>
      <span class="hud-text">${text}</span>
    </div>`
  ).join('');
  el.innerHTML = `<div class="hud-heading">${c.heading}</div>${items}`;
  return el;
}

function buildMinimap(c) {
  const arrows = {
    north:     '⬆️',
    northeast: '↗️',
    east:      '➡️',
    southeast: '↘️',
    south:     '⬇️',
    southwest: '↙️',
    west:      '⬅️',
    northwest: '↖️'
  };
  const arrow = arrows[c.direction] ?? '➡️';

  const el = document.createElement('div');
  el.className = 'ui-minimap';
  el.innerHTML = `
    <div class="minimap-label">${c.heading}</div>
    <div class="minimap-arrow">${arrow}</div>
    <div class="minimap-label">${c.description}</div>
    <div class="minimap-dist">${c.distance}</div>
  `;
  return el;
}

function buildStepByStep(c) {
  const el = document.createElement('div');
  el.className = 'ui-stepbystep';
  const steps = c.steps.map((text, i) =>
    `<div class="step-item" onclick="toggleStep(this)" data-index="${i}">
      <div class="step-num">${i + 1}</div>
      <span class="step-text">${text}</span>
    </div>`
  ).join('');
  el.innerHTML = `<div class="step-heading">${c.heading}</div>${steps}`;
  return el;
}

function buildAiButtons(c) {
  const el = document.createElement('div');
  el.className = 'ui-ai-buttons';
  const buttons = c.buttons.map(b =>
    `<button class="aib-btn" onclick="pressAiButton(this,'${b.action}')">${b.label}</button>`
  ).join('');
  el.innerHTML = `
    <div class="aib-heading">${c.heading}</div>
    <div class="aib-desc">${c.description}</div>
    <div class="aib-grid">${buttons}</div>
  `;
  return el;
}

/* ── Interactive overlay handlers ────────────────────────────────────────── */

function toggleHudItem(el) {
  el.classList.toggle('checked');
}

function toggleStep(el) {
  el.classList.toggle('done');
}

function pressAiButton(btn, action) {
  // Visually toggle; only one can be pressed
  btn.closest('.aib-grid').querySelectorAll('.aib-btn').forEach(b => b.classList.remove('pressed'));
  btn.classList.add('pressed');
}

/* ── Response form ───────────────────────────────────────────────────────── */

function selectBtn(btn, group, cls) {
  // Deselect all in the group
  const allSelected = [
    'selected-helpful','selected-neutral','selected-unhelpful',
    'selected-less','selected-ok','selected-more',
    'selected-auto','selected-manual','selected-both'
  ];
  document.querySelectorAll(`[data-group="${group}"]`).forEach(b => {
    allSelected.forEach(c => b.classList.remove(c));
  });
  btn.classList.add(cls);
  selections[group] = btn.dataset.value;
}

function pressDetail(btn, label) {
  document.querySelectorAll('#response-panel .rp-btn').forEach(b => {
    if (['btn-more-detail','btn-less-detail','btn-other-way'].includes(b.id)) {
      b.classList.remove('detail-pressed');
    }
  });
  btn.classList.add('detail-pressed');
  lastDetailRequest = label;
}

function resetFormButtons() {
  const allCls = [
    'selected-helpful','selected-neutral','selected-unhelpful',
    'selected-less','selected-ok','selected-more',
    'selected-auto','selected-manual','selected-both',
    'detail-pressed'
  ];
  document.querySelectorAll('#response-panel .rp-btn').forEach(b => {
    allCls.forEach(c => b.classList.remove(c));
  });
  document.getElementById('comment-input').value = '';
}

function submitResponse() {
  if (!currentScenario || !currentOption) return;

  const response = {
    participantId:    pid,
    scenarioId:       currentScenario.id,
    scenarioTitle:    currentScenario.title,
    optionId:         currentOption.id,
    optionTitle:      currentOption.title,
    helpfulness:      selections.helpfulness      ?? null,
    interventionLevel:selections.interventionLevel ?? null,
    activationMode:   selections.activationMode    ?? null,
    detailRequest:    lastDetailRequest,
    comment:          document.getElementById('comment-input').value.trim() || null
  };

  socket.emit('submit-response', response);

  // Show confirmation, hide form and UI overlay
  document.getElementById('response-panel').classList.remove('visible');
  document.getElementById('ui-overlay').innerHTML = '';

  const msg = document.getElementById('submitted-msg');
  msg.style.display = 'block';
  setTimeout(() => {
    msg.style.display = 'none';
    document.getElementById('waiting-screen').style.display = 'flex';
  }, 2500);
}
