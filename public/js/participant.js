/* ── Participant ID ─────────────────────────────────────────────────────── */
const params = new URLSearchParams(window.location.search);
const pid    = params.get('pid') || 'P?';
document.getElementById('pid-label').textContent = pid;

/* ── Response state ─────────────────────────────────────────────────────── */
let currentScenario   = null;
let currentOption     = null;
let selections        = {};
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

  const rp = document.getElementById('response-panel');
  rp.classList.remove('visible', 'rp-minimized');
  document.getElementById('rp-toggle-btn').textContent = '▾ 접기';
  resetFormButtons();

  renderUI(option);
  emitEvent('screen_shown');

  setTimeout(() => rp.classList.add('visible'), 600);
});

socket.on('reset', () => {
  emitEvent('reset_received');
  currentScenario   = null;
  currentOption     = null;
  lastDetailRequest = null;
  selections        = {};

  document.getElementById('ui-overlay').innerHTML = '';
  document.getElementById('waiting-screen').style.display = 'flex';
  document.getElementById('response-panel').classList.remove('visible', 'rp-minimized');
  document.getElementById('submitted-msg').style.display  = 'none';
});

/* ── Event logging helper ────────────────────────────────────────────────── */
function emitEvent(type) {
  socket.emit('log-event', {
    type,
    participantId: pid,
    scenarioId:    currentScenario?.id  ?? null,
    optionId:      currentOption?.id    ?? null
  });
}

/* ── Drag-and-drop utility ───────────────────────────────────────────────── */
function makeDraggable(el, handle) {
  handle.style.cursor = 'grab';
  let startX, startY, startL, startT, active = false;

  function startDrag(cx, cy) {
    const rect = el.getBoundingClientRect();
    // Freeze current rendered position as absolute pixels,
    // removing transform/bottom/right anchoring so drag math is simple.
    el.style.left      = rect.left + 'px';
    el.style.top       = rect.top  + 'px';
    el.style.right     = 'auto';
    el.style.bottom    = 'auto';
    el.style.transform = 'none';
    el.style.margin    = '0';
    startX = cx; startY = cy;
    startL = rect.left; startT = rect.top;
    active = true;
    handle.style.cursor = 'grabbing';
  }

  function doDrag(cx, cy) {
    if (!active) return;
    el.style.left = (startL + cx - startX) + 'px';
    el.style.top  = (startT + cy - startY) + 'px';
  }

  function stopDrag() {
    active = false;
    handle.style.cursor = 'grab';
    document.removeEventListener('mousemove', onMM);
    document.removeEventListener('mouseup',   onMU);
    document.removeEventListener('touchmove', onTM);
    document.removeEventListener('touchend',  onTE);
  }

  const onMM = (e) => doDrag(e.clientX, e.clientY);
  const onMU = () => stopDrag();
  const onTM = (e) => { e.preventDefault(); doDrag(e.touches[0].clientX, e.touches[0].clientY); };
  const onTE = () => stopDrag();

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    document.addEventListener('mousemove', onMM);
    document.addEventListener('mouseup',   onMU);
  });

  handle.addEventListener('touchstart', (e) => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
    document.addEventListener('touchmove', onTM, { passive: false });
    document.addEventListener('touchend',  onTE);
  }, { passive: true });
}

/* ── Drag bar helper ─────────────────────────────────────────────────────── */
function buildDragBar(label) {
  const bar = document.createElement('div');
  bar.className = 'panel-drag-bar';
  bar.innerHTML = `<span class="drag-grip">⠿</span><span>${label}</span>`;
  return bar;
}

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
      overlay.innerHTML = `<div style="color:#fff;padding:2rem">알 수 없는 UI 유형: ${option.type}</div>`;
  }
}

/* ── UI builders ─────────────────────────────────────────────────────────── */

function buildPopup(c) {
  const el = document.createElement('div');
  el.className = 'ui-popup';

  const bar = buildDragBar('팝업 안내');

  const inner = document.createElement('div');
  inner.className = 'panel-inner';
  inner.innerHTML = `
    <div class="pop-icon">${c.icon ?? '💡'}</div>
    <div class="pop-heading">${c.heading}</div>
    <div class="pop-body">${c.body}</div>
  `;

  el.appendChild(bar);
  el.appendChild(inner);
  makeDraggable(el, bar);
  return el;
}

function buildSidePanel(c) {
  const el = document.createElement('div');
  el.className = 'ui-sidepanel';

  const bar = buildDragBar('사이드 패널');

  const sections = c.sections.map(s =>
    `<div class="sp-section">
      <div class="sp-title">${s.title}</div>
      <div class="sp-body">${s.body}</div>
    </div>`
  ).join('');

  const inner = document.createElement('div');
  inner.className = 'panel-inner';
  inner.innerHTML = `<div class="panel-heading">${c.heading}</div>${sections}`;

  el.appendChild(bar);
  el.appendChild(inner);
  makeDraggable(el, bar);
  return el;
}

function buildHudChecklist(c) {
  const el = document.createElement('div');
  el.className = 'ui-hud-checklist';

  const bar = buildDragBar('체크리스트');

  const items = c.items.map((text, i) =>
    `<div class="hud-item" onclick="toggleHudItem(this)" data-index="${i}">
      <div class="hud-checkbox">✓</div>
      <span class="hud-text">${text}</span>
    </div>`
  ).join('');

  const inner = document.createElement('div');
  inner.className = 'panel-inner';
  inner.innerHTML = `<div class="hud-heading">${c.heading}</div>${items}`;

  el.appendChild(bar);
  el.appendChild(inner);
  makeDraggable(el, bar);
  return el;
}

function buildMinimap(c) {
  const arrows = {
    north:'⬆️', northeast:'↗️', east:'➡️', southeast:'↘️',
    south:'⬇️', southwest:'↙️', west:'⬅️', northwest:'↖️'
  };

  const el = document.createElement('div');
  el.className = 'ui-minimap';

  const bar = buildDragBar('길 안내');

  const inner = document.createElement('div');
  inner.className = 'panel-inner';
  inner.innerHTML = `
    <div class="minimap-label">${c.heading}</div>
    <div class="minimap-arrow">${arrows[c.direction] ?? '➡️'}</div>
    <div class="minimap-label">${c.description}</div>
    <div class="minimap-dist">${c.distance}</div>
  `;

  el.appendChild(bar);
  el.appendChild(inner);
  makeDraggable(el, bar);
  return el;
}

function buildStepByStep(c) {
  const el = document.createElement('div');
  el.className = 'ui-stepbystep';

  const bar = buildDragBar('단계별 안내');

  const steps = c.steps.map((text, i) =>
    `<div class="step-item" onclick="toggleStep(this)" data-index="${i}">
      <div class="step-num">${i + 1}</div>
      <span class="step-text">${text}</span>
    </div>`
  ).join('');

  const inner = document.createElement('div');
  inner.className = 'panel-inner';
  inner.innerHTML = `<div class="step-heading">${c.heading}</div>${steps}`;

  el.appendChild(bar);
  el.appendChild(inner);
  makeDraggable(el, bar);
  return el;
}

function buildAiButtons(c) {
  const el = document.createElement('div');
  el.className = 'ui-ai-buttons';

  const bar = buildDragBar('AI 추천');

  const buttons = c.buttons.map(b =>
    `<button class="aib-btn" onclick="pressAiButton(this,'${b.action}')">${b.label}</button>`
  ).join('');

  const inner = document.createElement('div');
  inner.className = 'panel-inner';
  inner.innerHTML = `
    <div class="aib-heading">${c.heading}</div>
    <div class="aib-desc">${c.description}</div>
    <div class="aib-grid">${buttons}</div>
  `;

  el.appendChild(bar);
  el.appendChild(inner);
  makeDraggable(el, bar);
  return el;
}

/* ── Interactive overlay handlers ────────────────────────────────────────── */

function toggleHudItem(el) { el.classList.toggle('checked'); }
function toggleStep(el)     { el.classList.toggle('done'); }

function pressAiButton(btn) {
  btn.closest('.aib-grid').querySelectorAll('.aib-btn').forEach(b => b.classList.remove('pressed'));
  btn.classList.add('pressed');
}

/* ── Response panel toggle ───────────────────────────────────────────────── */

function toggleRpBody(e) {
  e.stopPropagation();
  const panel = document.getElementById('response-panel');
  const btn   = document.getElementById('rp-toggle-btn');
  panel.classList.toggle('rp-minimized');
  btn.textContent = panel.classList.contains('rp-minimized') ? '▴ 펼치기' : '▾ 접기';
}

/* ── Response form ───────────────────────────────────────────────────────── */

function selectBtn(btn, group, cls) {
  const allCls = [
    'selected-helpful','selected-neutral','selected-unhelpful',
    'selected-less','selected-ok','selected-more',
    'selected-auto','selected-manual','selected-both'
  ];
  document.querySelectorAll(`[data-group="${group}"]`).forEach(b =>
    allCls.forEach(c => b.classList.remove(c))
  );
  btn.classList.add(cls);
  selections[group] = btn.dataset.value;
}

function pressDetail(btn, label) {
  ['btn-more-detail','btn-less-detail','btn-other-way'].forEach(id => {
    document.getElementById(id).classList.remove('detail-pressed');
  });
  btn.classList.add('detail-pressed');
  lastDetailRequest = label;

  const eventType = label === '더 자세히'    ? 'detail_more_clicked'
                  : label === '덜 자세히'    ? 'detail_less_clicked'
                  : 'alternative_requested';
  emitEvent(eventType);
}

function resetFormButtons() {
  const allCls = [
    'selected-helpful','selected-neutral','selected-unhelpful',
    'selected-less','selected-ok','selected-more',
    'selected-auto','selected-manual','selected-both','detail-pressed'
  ];
  document.querySelectorAll('#response-panel .rp-btn').forEach(b =>
    allCls.forEach(c => b.classList.remove(c))
  );
  document.getElementById('comment-input').value = '';
}

function submitResponse() {
  if (!currentScenario || !currentOption) return;

  const response = {
    participantId:     pid,
    scenarioId:        currentScenario.id,
    scenarioTitle:     currentScenario.title,
    optionId:          currentOption.id,
    optionTitle:       currentOption.title,
    helpfulness:       selections.helpfulness       ?? null,
    interventionLevel: selections.interventionLevel  ?? null,
    activationMode:    selections.activationMode     ?? null,
    detailRequest:     lastDetailRequest,
    comment:           document.getElementById('comment-input').value.trim() || null
  };

  socket.emit('submit-response', response);
  emitEvent('response_submitted');

  const rp = document.getElementById('response-panel');
  rp.classList.remove('visible', 'rp-minimized');
  document.getElementById('rp-toggle-btn').textContent = '▾ 접기';
  document.getElementById('ui-overlay').innerHTML = '';

  const msg = document.getElementById('submitted-msg');
  msg.style.display = 'block';
  setTimeout(() => {
    msg.style.display = 'none';
    document.getElementById('waiting-screen').style.display = 'flex';
  }, 2500);
}

/* ── Background image upload ─────────────────────────────────────────────── */
function setBgImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const gs = document.getElementById('game-screen');
    gs.style.backgroundImage   = `url(${e.target.result})`;
    gs.style.backgroundSize    = 'cover';
    gs.style.backgroundPosition = 'center';
  };
  reader.readAsDataURL(file);
  input.value = '';
}

/* ── Init: make response panel draggable ─────────────────────────────────── */
makeDraggable(
  document.getElementById('response-panel'),
  document.getElementById('rp-drag-header')
);
