/* ── Participant ID ─────────────────────────────────────────────────────── */
const params = new URLSearchParams(window.location.search);
const pid    = params.get('pid') || 'P?';
document.getElementById('pid-label').textContent = pid;

/* ── Response state ─────────────────────────────────────────────────────── */
let currentScenario   = null;
let currentOption     = null;
let currentScenarioOneRoot = null;

/* ── Socket ─────────────────────────────────────────────────────────────── */
const socket = io({ query: { role: 'participant', pid } });

socket.on('show-ui', ({ scenario, option }) => {
  currentScenario   = scenario;
  currentOption     = option;

  document.getElementById('waiting-screen').style.display = 'none';

  const scenarioOneVariant = getScenarioOneVariant(scenario, option);
  const scenarioTwoVariant = getScenarioTwoVariant(scenario, option);
  const scenarioThreeVariant = getScenarioThreeVariant(scenario, option);
  const scenarioFiveVariant = getScenarioFiveVariant(scenario, option);
  const scenarioSevenVariant = getScenarioSevenVariant(scenario, option);

  if (scenarioOneVariant) {
    currentOption = {
      ...option,
      title: SCENARIO_ONE_TITLES[scenarioOneVariant],
      workshopVariant: scenarioOneVariant
    };
  } else if (scenarioTwoVariant) {
    currentOption = {
      ...option,
      title: SCENARIO_TWO_TITLES[scenarioTwoVariant],
      workshopVariant: scenarioTwoVariant
    };
  } else if (scenarioThreeVariant) {
    currentOption = {
      ...option,
      title: SCENARIO_THREE_TITLES[scenarioThreeVariant],
      workshopVariant: scenarioThreeVariant
    };
  } else if (scenarioFiveVariant) {
    currentOption = {
      ...option,
      title: SCENARIO_FIVE_TITLES[scenarioFiveVariant],
      workshopVariant: scenarioFiveVariant
    };
  } else if (scenarioSevenVariant) {
    currentOption = {
      ...option,
      title: SCENARIO_SEVEN_TITLES[scenarioSevenVariant],
      workshopVariant: scenarioSevenVariant
    };
  }

  renderUI(currentOption, currentScenario);
  emitEvent('screen_shown');


});

socket.on('reset', () => {
  emitEvent('reset_received');
  currentScenario   = null;
  currentOption     = null;
  currentScenarioOneRoot = null;

  document.getElementById('ui-overlay').innerHTML = '';
  document.getElementById('waiting-screen').style.display = 'flex';
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
function renderUI(option, scenario = currentScenario) {
  const overlay = document.getElementById('ui-overlay');
  currentScenarioOneRoot = null;
  overlay.innerHTML = '';

  const scenarioOneVariant = getScenarioOneVariant(scenario, option);
  if (scenarioOneVariant) {
    overlay.appendChild(buildScenarioOneOption(scenarioOneVariant, scenario, option));
    return;
  }

  const scenarioTwoVariant = getScenarioTwoVariant(scenario, option);
  if (scenarioTwoVariant) {
    overlay.appendChild(buildScenarioTwoOption(scenarioTwoVariant, scenario, option));
    return;
  }

  const scenarioThreeVariant = getScenarioThreeVariant(scenario, option);
  if (scenarioThreeVariant) {
    overlay.appendChild(buildScenarioThreeOption(scenarioThreeVariant, scenario, option));
    return;
  }

  const scenarioFiveVariant = getScenarioFiveVariant(scenario, option);
  if (scenarioFiveVariant) {
    overlay.appendChild(buildScenarioFiveOption(scenarioFiveVariant, scenario, option));
    return;
  }

  const scenarioSevenVariant = getScenarioSevenVariant(scenario, option);
  if (scenarioSevenVariant) {
    overlay.appendChild(buildScenarioSevenOption(scenarioSevenVariant, scenario, option));
    return;
  }

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

/* ── 상황 1: 사용자가 제공한 이미지 파일을 그대로 표시 ─────────────────── */
const SCENARIO_ONE_VARIANTS = [
  'accessibility-chat',
  'accessibility-checklist',
  'accessibility-reviews'
];

const SCENARIO_ONE_ALIASES = {
  'accessibility-compare': 'accessibility-checklist',
  'accessibility-summary': 'accessibility-reviews'
};

const SCENARIO_ONE_TITLES = {
  'accessibility-chat': '채팅형',
  'accessibility-checklist': '체크리스트형',
  'accessibility-reviews': '플레이어 리뷰 형'
};

const SCENARIO_ONE_IMAGES = {
  'accessibility-chat': '/images/scenario1-chat.png',
  'accessibility-checklist': '/images/scenario1-checklist.png',
  'accessibility-reviews': '/images/scenario1-player-reviews.png'
};

function normalizeScenarioOneVariant(variant) {
  return SCENARIO_ONE_ALIASES[variant] || variant;
}

function getScenarioOneVariant(scenario, option) {
  const explicitVariant = normalizeScenarioOneVariant(option?.workshopVariant);
  if (SCENARIO_ONE_VARIANTS.includes(explicitVariant)) return explicitVariant;

  if (!scenario?.isWorkshopScenarioOne || !Array.isArray(scenario.options)) return null;
  const optionIndex = scenario.options.findIndex(item => item.id === option?.id);
  return SCENARIO_ONE_VARIANTS[optionIndex] || null;
}

function buildScenarioOneOption(variant) {
  const normalizedVariant = normalizeScenarioOneVariant(variant);
  const root = document.createElement('div');
  root.className = `ui-s1-option ${normalizedVariant}`;
  root.setAttribute('aria-label', '상황 1 UI 이미지 오버레이');

  const frame = document.createElement('div');
  frame.className = 's1-prototype-frame';
  frame.setAttribute('role', 'dialog');
  frame.setAttribute('aria-label', `${SCENARIO_ONE_TITLES[normalizedVariant]} 이미지`);
  frame.title = '드래그하여 이동 · 오른쪽 아래 모서리에서 크기 조정';

  const image = document.createElement('img');
  image.className = 's1-prototype-image';
  image.src = SCENARIO_ONE_IMAGES[normalizedVariant];
  image.alt = `상황 1 ${SCENARIO_ONE_TITLES[normalizedVariant]} UI 시안`;
  image.draggable = false;

  image.addEventListener('load', () => fitScenarioOneImage(frame, image));
  frame.appendChild(image);
  root.appendChild(frame);

  // 이미지 바깥 영역을 누르면 닫습니다.
  root.addEventListener('pointerdown', event => {
    if (event.target === root) hideScenarioOneImage(root);
  });

  makeScenarioOneImageDraggable(frame, root);
  currentScenarioOneRoot = root;
  return root;
}

function fitScenarioOneImage(frame, image) {
  const outerGap = window.innerWidth <= 720 ? 16 : 48;
  const maxWidth = Math.max(220, window.innerWidth - outerGap);
  const maxHeight = Math.max(160, window.innerHeight - outerGap);
  const ratio = image.naturalWidth / image.naturalHeight || 1;

  let width = Math.min(image.naturalWidth, maxWidth);
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  frame.style.width = `${Math.round(width)}px`;
  frame.style.height = `${Math.round(height)}px`;
}

function makeScenarioOneImageDraggable(frame, root) {
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let moved = false;

  const isResizeHandle = event => {
    const rect = frame.getBoundingClientRect();
    const handleSize = 28;
    return event.clientX >= rect.right - handleSize
      && event.clientY >= rect.bottom - handleSize;
  };

  frame.addEventListener('pointerdown', event => {
    if (event.button !== 0 || isResizeHandle(event)) return;
    if (event.target.closest('button, input, select, textarea, label, [data-no-drag]')) return;

    const frameRect = frame.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();

    frame.style.left = `${frameRect.left - rootRect.left}px`;
    frame.style.top = `${frameRect.top - rootRect.top}px`;
    frame.style.right = 'auto';
    frame.style.bottom = 'auto';
    frame.style.transform = 'none';

    dragging = true;
    moved = false;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startLeft = frameRect.left - rootRect.left;
    startTop = frameRect.top - rootRect.top;

    frame.classList.add('is-dragging');
    frame.setPointerCapture(pointerId);
    event.preventDefault();
    event.stopPropagation();
  });

  frame.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== pointerId) return;

    const rootRect = root.getBoundingClientRect();
    const width = frame.offsetWidth;
    const height = frame.offsetHeight;
    const minVisible = 48;

    const rawLeft = startLeft + event.clientX - startX;
    const rawTop = startTop + event.clientY - startY;
    const minLeft = minVisible - width;
    const maxLeft = rootRect.width - minVisible;
    const minTop = minVisible - height;
    const maxTop = rootRect.height - minVisible;

    frame.style.left = `${Math.min(maxLeft, Math.max(minLeft, rawLeft))}px`;
    frame.style.top = `${Math.min(maxTop, Math.max(minTop, rawTop))}px`;
    moved = moved || Math.abs(event.clientX - startX) > 3 || Math.abs(event.clientY - startY) > 3;
  });

  const stopDragging = event => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    frame.classList.remove('is-dragging');
    if (frame.hasPointerCapture(pointerId)) frame.releasePointerCapture(pointerId);
    pointerId = null;
    if (moved) {
      frame.dataset.justDragged = 'true';
      window.setTimeout(() => delete frame.dataset.justDragged, 0);
      emitEvent('workshop_overlay_moved');
    } else if (frame.dataset.workshopTap === 'true') {
      frame.dispatchEvent(new CustomEvent('workshoptap'));
    }
  };

  frame.addEventListener('pointerup', stopDragging);
  frame.addEventListener('pointercancel', stopDragging);
}

function hideScenarioOneImage(root = currentScenarioOneRoot) {
  if (!root || !root.isConnected) return;
  root.classList.add('s1-image-hidden');
  root.setAttribute('aria-hidden', 'true');
  emitEvent('scenario_one_image_closed');
}

function showScenarioOneImage(root = currentScenarioOneRoot) {
  if (!root || !root.isConnected) return;
  root.classList.remove('s1-image-hidden');
  root.removeAttribute('aria-hidden');
  emitEvent('scenario_one_image_reopened');
}

// Ctrl+G를 누르면 현재 워크숍 UI를 다시 표시합니다.
document.addEventListener('keydown', event => {
  if (!event.ctrlKey || event.altKey || event.metaKey || event.key.toLowerCase() !== 'g') return;
  if (!currentScenarioOneRoot || !currentScenarioOneRoot.isConnected) return;
  event.preventDefault();
  showScenarioOneImage();
});


/* ── 상황 2: 접근성 초기 설정 UI 옵션 5종 ──────────────────────────────── */
const SCENARIO_TWO_VARIANTS = [
  'setup-chat',
  'setup-manual',
  'setup-auto',
  'setup-checklist',
  'setup-cards'
];

const SCENARIO_TWO_TITLES = {
  'setup-chat': '채팅형',
  'setup-manual': '설정 수동 커스터마이징 형',
  'setup-auto': '자동설정형',
  'setup-checklist': '체크리스트형',
  'setup-cards': '카드형'
};

const SCENARIO_TWO_IMAGES = {
  'setup-chat': '/images/scenario2-chat.png',
  'setup-auto': '/images/scenario2-auto-card.png',
  'setup-auto-details': '/images/scenario2-auto-details.png',
  'setup-checklist': '/images/scenario2-checklist.png'
};

function getScenarioTwoVariant(scenario, option) {
  if (SCENARIO_TWO_VARIANTS.includes(option?.workshopVariant)) {
    return option.workshopVariant;
  }

  if (!scenario?.isWorkshopScenarioTwo || !Array.isArray(scenario.options)) return null;
  const optionIndex = scenario.options.findIndex(item => item.id === option?.id);
  return SCENARIO_TWO_VARIANTS[optionIndex] || null;
}

function buildScenarioTwoOption(variant) {
  switch (variant) {
    case 'setup-chat':
      return buildScenarioTwoImageOption(
        variant,
        SCENARIO_TWO_IMAGES['setup-chat'],
        '상황 2 채팅형 UI 시안'
      );
    case 'setup-manual':
      return buildScenarioTwoManualSettings();
    case 'setup-auto':
      return buildScenarioTwoAutoSettings();
    case 'setup-checklist':
      return buildScenarioTwoChecklist();
    case 'setup-cards':
      return buildScenarioTwoCards();
    default:
      return buildScenarioTwoImageOption(
        'setup-chat',
        SCENARIO_TWO_IMAGES['setup-chat'],
        '상황 2 UI 시안'
      );
  }
}

function createScenarioTwoShell(variant, ariaLabel, width = 820, height = 700) {
  const root = document.createElement('div');
  root.className = `ui-s1-option ui-s2-option ${variant}`;
  root.setAttribute('aria-label', ariaLabel);

  const frame = document.createElement('div');
  frame.className = 's1-prototype-frame s2-prototype-frame';
  frame.setAttribute('role', 'dialog');
  frame.setAttribute('aria-label', ariaLabel);
  frame.style.width = `min(${width}px, calc(100vw - 48px))`;
  frame.style.height = `min(${height}px, calc(100vh - 48px))`;

  root.appendChild(frame);
  root.addEventListener('pointerdown', event => {
    if (event.target === root) hideScenarioOneImage(root);
  });

  makeScenarioOneImageDraggable(frame, root);
  currentScenarioOneRoot = root;
  return { root, frame };
}

function buildScenarioTwoImageOption(variant, src, alt) {
  const { root, frame } = createScenarioTwoShell(variant, alt);

  const image = document.createElement('img');
  image.className = 's1-prototype-image';
  image.src = src;
  image.alt = alt;
  image.draggable = false;
  image.addEventListener('load', () => fitScenarioOneImage(frame, image));

  frame.appendChild(image);
  return root;
}

function buildScenarioTwoManualSettings() {
  const { root, frame } = createScenarioTwoShell(
    'setup-manual',
    '접근성 설정 수동 커스터마이징',
    760,
    820
  );

  frame.classList.add('s2-ui-frame');
  frame.innerHTML = `
    <article class="s2-panel s2-manual-panel">
      <header class="s2-panel-header">
        <h2>접근성 설정 변경</h2>
        <button type="button" class="s2-close-btn" data-no-drag aria-label="닫기">×</button>
      </header>

      <div class="s2-setting-table">
        <div class="s2-setting-row s2-setting-head">
          <b>변경 기능</b><b>변경 전</b><b>변경 후</b>
        </div>

        <div class="s2-setting-row">
          <span>색 보정</span><span>OFF</span>
          <button type="button" class="s2-toggle" data-setting="colorCorrection"
                  data-no-drag aria-pressed="true">ON</button>
        </div>

        <div class="s2-setting-row">
          <span>고대비</span><span>OFF</span>
          <button type="button" class="s2-toggle" data-setting="highContrast"
                  data-no-drag aria-pressed="true">ON</button>
        </div>

        <div class="s2-setting-row">
          <span>텍스트 크기</span><span>작음</span>
          <select data-setting="textSize" data-no-drag aria-label="텍스트 크기">
            <option value="small">작음</option>
            <option value="medium">중간</option>
            <option value="large" selected>큼</option>
          </select>
        </div>

        <div class="s2-setting-row">
          <span>지원 언어</span><span>영어</span>
          <select data-setting="language" data-no-drag aria-label="지원 언어">
            <option value="영어">영어</option>
            <option value="한국어" selected>한국어</option>
            <option value="일본어">일본어</option>
          </select>
        </div>

        <div class="s2-setting-row">
          <span>밝기</span><span>40%</span>
          <div class="s2-range-control">
            <input type="range" min="40" max="100" step="10" value="100"
                   data-setting="brightness" data-no-drag aria-label="밝기">
            <output>100%</output>
          </div>
        </div>
      </div>

      <div class="s2-manual-preview" aria-live="polite">
        <span class="s2-preview-kicker">변경되는 화면 미리보기</span>
        <strong>가독성 미리보기 텍스트</strong>
        <p>선택한 색 보정, 고대비, 텍스트 크기와 밝기가 이 영역에 즉시 반영됩니다.</p>
      </div>

      <p class="s2-action-status" aria-live="polite"></p>

      <footer class="s2-panel-actions">
        <button type="button" class="s2-secondary-btn" data-action="reset" data-no-drag>취소</button>
        <button type="button" class="s2-primary-btn" data-action="apply" data-no-drag>이렇게 변경할게요</button>
      </footer>
    </article>`;

  const closeButton = frame.querySelector('.s2-close-btn');
  closeButton.addEventListener('click', () => hideScenarioOneImage(root));

  const toggles = frame.querySelectorAll('.s2-toggle');
  toggles.forEach(button => {
    button.addEventListener('click', () => {
      const active = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'ON' : 'OFF';
      updateScenarioTwoManualPreview(frame);
      emitEvent('scenario_two_manual_setting_changed');
    });
  });

  frame.querySelectorAll('select, input[type="range"]').forEach(control => {
    control.addEventListener('input', () => {
      updateScenarioTwoManualPreview(frame);
      emitEvent('scenario_two_manual_setting_changed');
    });
  });

  frame.querySelector('[data-action="reset"]').addEventListener('click', () => {
    toggles.forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.textContent = 'OFF';
    });
    frame.querySelector('[data-setting="textSize"]').value = 'small';
    frame.querySelector('[data-setting="language"]').value = '영어';
    frame.querySelector('[data-setting="brightness"]').value = '40';
    frame.querySelector('.s2-action-status').textContent = '변경을 취소하고 기존 설정으로 되돌렸어요.';
    updateScenarioTwoManualPreview(frame);
    emitEvent('scenario_two_manual_reset');
  });

  frame.querySelector('[data-action="apply"]').addEventListener('click', () => {
    frame.querySelector('.s2-action-status').textContent = '선택한 접근성 설정을 적용했어요.';
    emitEvent('scenario_two_manual_applied');
  });

  updateScenarioTwoManualPreview(frame);
  return root;
}

function updateScenarioTwoManualPreview(frame) {
  const preview = frame.querySelector('.s2-manual-preview');
  if (!preview) return;

  const colorCorrection = frame.querySelector('[data-setting="colorCorrection"]').getAttribute('aria-pressed') === 'true';
  const highContrast = frame.querySelector('[data-setting="highContrast"]').getAttribute('aria-pressed') === 'true';
  const textSize = frame.querySelector('[data-setting="textSize"]').value;
  const language = frame.querySelector('[data-setting="language"]').value;
  const brightness = Number(frame.querySelector('[data-setting="brightness"]').value);

  frame.querySelector('.s2-range-control output').textContent = `${brightness}%`;

  preview.classList.toggle('color-correction-on', colorCorrection);
  preview.classList.toggle('high-contrast-on', highContrast);
  preview.dataset.textSize = textSize;
  preview.style.filter = `brightness(${brightness}%)`;
  preview.querySelector('.s2-preview-kicker').textContent = `미리보기 · ${language}`;
}

function buildScenarioTwoAutoSettings() {
  const { root, frame } = createScenarioTwoShell(
    'setup-auto',
    '접근성 자동 설정 완료 안내',
    880,
    420
  );

  frame.classList.add('s2-auto-frame');
  frame.dataset.workshopTap = 'true';

  const image = document.createElement('img');
  image.className = 's1-prototype-image s2-auto-image';
  image.src = SCENARIO_TWO_IMAGES['setup-auto'];
  image.alt = '접근성 자동 설정 완료. 클릭하면 변경 내용을 자세히 확인할 수 있습니다.';
  image.draggable = false;

  image.addEventListener('load', () => fitScenarioOneImage(frame, image));

  frame.addEventListener('workshoptap', () => {
    const showingDetails = frame.dataset.view === 'details';
    frame.dataset.view = showingDetails ? 'compact' : 'details';
    image.src = showingDetails
      ? SCENARIO_TWO_IMAGES['setup-auto']
      : SCENARIO_TWO_IMAGES['setup-auto-details'];
    image.alt = showingDetails
      ? '접근성 자동 설정 완료. 클릭하면 변경 내용을 자세히 확인할 수 있습니다.'
      : '접근성 자동 설정 변경 내용';
    emitEvent(showingDetails ? 'scenario_two_auto_summary_shown' : 'scenario_two_auto_details_shown');
  });

  frame.dataset.view = 'compact';
  frame.appendChild(image);
  return root;
}


function buildScenarioTwoChecklist() {
  const { root, frame } = createScenarioTwoShell(
    'setup-checklist',
    '초기 접근성 설정 체크리스트',
    620,
    820
  );

  frame.classList.add('s2-ui-frame', 's2-checklist-frame');
  frame.innerHTML = `
    <article class="s2-panel s2-checklist-panel">
      <header class="s2-checklist-header">
        <button type="button" class="s2-checklist-back" data-no-drag aria-label="닫기">›</button>
        <div>초기 접근성 설정</div>
      </header>

      <div class="s2-checklist-list" role="group" aria-label="초기 접근성 설정 단계">
        ${[
          ['그래픽 품질 선택 (권장: 중간)', true],
          ['자막 설정 켜기', true],
          ['텍스트 크기 조절 (권장: 크게)', false],
          ['키 배치 접근성 프리셋 선택', false],
          ['설정 저장 후 게임 시작', false]
        ].map(([label, checked], index) => `
          <label class="s2-check-item ${checked ? 'checked' : ''}">
            <input type="checkbox" data-no-drag ${checked ? 'checked' : ''}>
            <span class="s2-check-box" aria-hidden="true"></span>
            <span class="s2-check-text">${label}</span>
          </label>
        `).join('')}
      </div>

      <p class="s2-check-progress" aria-live="polite"></p>
    </article>`;

  frame.querySelector('.s2-checklist-back').addEventListener('click', () => hideScenarioOneImage(root));

  const items = Array.from(frame.querySelectorAll('.s2-check-item'));
  const updateProgress = () => {
    const completed = items.filter(item => item.querySelector('input').checked).length;
    items.forEach(item => {
      item.classList.toggle('checked', item.querySelector('input').checked);
    });
    frame.querySelector('.s2-check-progress').textContent =
      `${completed} / ${items.length} 단계 완료`;
  };

  items.forEach(item => {
    item.querySelector('input').addEventListener('change', () => {
      updateProgress();
      emitEvent('scenario_two_checklist_toggled');
    });
  });

  updateProgress();
  return root;
}


function buildScenarioTwoCards() {
  const { root, frame } = createScenarioTwoShell(
    'setup-cards',
    '접근성 설정 카드 선택',
    860,
    760
  );

  frame.classList.add('s2-ui-frame');
  frame.innerHTML = `
    <article class="s2-panel s2-card-panel">
      <header class="s2-panel-header">
        <h2>접근성 설정 마법사</h2>
        <button type="button" class="s2-close-btn" data-no-drag aria-label="닫기">×</button>
      </header>

      <p class="s2-card-help">필요한 설정 카드를 하나 이상 선택하세요.</p>

      <div class="s2-card-grid" role="group" aria-label="접근성 설정 선택">
        <button type="button" class="s2-setting-card" data-value="시각 보조 설정 적용"
                data-no-drag aria-pressed="false">
          <strong>시각 보조 설정 적용</strong><span class="s2-card-icon">◉</span>
        </button>
        <button type="button" class="s2-setting-card" data-value="조작 편의 설정 적용"
                data-no-drag aria-pressed="false">
          <strong>조작 편의 설정 적용</strong><span class="s2-card-icon">☝</span>
        </button>
        <button type="button" class="s2-setting-card" data-value="청각 보조 설정 적용"
                data-no-drag aria-pressed="false">
          <strong>청각 보조 설정 적용</strong><span class="s2-card-icon">◖</span>
        </button>
        <button type="button" class="s2-setting-card" data-value="인지 지원 설정 적용"
                data-no-drag aria-pressed="false">
          <strong>인지 지원 설정 적용</strong><span class="s2-card-icon">▤</span>
        </button>
      </div>

      <p class="s2-card-selection" aria-live="polite">선택된 카드가 없습니다.</p>

      <footer class="s2-panel-actions">
        <button type="button" class="s2-secondary-btn" data-action="clear" data-no-drag>취소</button>
        <button type="button" class="s2-primary-btn" data-action="apply" data-no-drag>이렇게 변경할게요</button>
      </footer>
    </article>`;

  frame.querySelector('.s2-close-btn').addEventListener('click', () => hideScenarioOneImage(root));

  const cards = Array.from(frame.querySelectorAll('.s2-setting-card'));
  const updateSelection = () => {
    const selected = cards
      .filter(card => card.getAttribute('aria-pressed') === 'true')
      .map(card => card.dataset.value);
    frame.querySelector('.s2-card-selection').textContent = selected.length
      ? `선택: ${selected.join(', ')}`
      : '선택된 카드가 없습니다.';
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const selected = card.getAttribute('aria-pressed') !== 'true';
      card.setAttribute('aria-pressed', String(selected));
      card.classList.toggle('selected', selected);
      updateSelection();
      emitEvent('scenario_two_card_toggled');
    });
  });

  frame.querySelector('[data-action="clear"]').addEventListener('click', () => {
    cards.forEach(card => {
      card.setAttribute('aria-pressed', 'false');
      card.classList.remove('selected');
    });
    updateSelection();
    emitEvent('scenario_two_cards_cleared');
  });

  frame.querySelector('[data-action="apply"]').addEventListener('click', () => {
    const selectedCount = cards.filter(card => card.getAttribute('aria-pressed') === 'true').length;
    frame.querySelector('.s2-card-selection').textContent = selectedCount
      ? `${selectedCount}개 접근성 설정 카드를 적용했어요.`
      : '적용할 카드를 먼저 선택해 주세요.';
    emitEvent('scenario_two_cards_applied');
  });

  return root;
}



/* ── 상황 3: 상점 찾기 및 패키지 구매 지원 UI 3종 ─────────────────────── */
const SCENARIO_THREE_VARIANTS = [
  'shop-chat',
  'shop-checklist',
  'shop-highlight'
];

const SCENARIO_THREE_TITLES = {
  'shop-chat': '채팅형',
  'shop-checklist': '체크리스트 형',
  'shop-highlight': '화면 하이라이팅형'
};

const SCENARIO_THREE_IMAGES = {
  'shop-chat': '/images/scenario3-chat.png',
  'shop-highlight-home': '/images/scenario3-highlight-home.png',
  'shop-highlight-shop': '/images/scenario3-highlight-shop.png'
};

function getScenarioThreeVariant(scenario, option) {
  if (SCENARIO_THREE_VARIANTS.includes(option?.workshopVariant)) {
    return option.workshopVariant;
  }

  if (!scenario?.isWorkshopScenarioThree || !Array.isArray(scenario.options)) return null;
  const optionIndex = scenario.options.findIndex(item => item.id === option?.id);
  return SCENARIO_THREE_VARIANTS[optionIndex] || null;
}

function createScenarioThreeShell(variant, ariaLabel, width = 820, height = 700) {
  const shell = createScenarioTwoShell(variant, ariaLabel, width, height);
  shell.root.classList.add('ui-s3-option');
  return shell;
}

function buildScenarioThreeOption(variant) {
  switch (variant) {
    case 'shop-chat':
      return buildScenarioThreeImageOption(
        variant,
        SCENARIO_THREE_IMAGES['shop-chat'],
        '상황 3 채팅형 UI 시안'
      );
    case 'shop-checklist':
      return buildScenarioThreeChecklist();
    case 'shop-highlight':
      return buildScenarioThreeHighlight();
    default:
      return buildScenarioThreeImageOption(
        'shop-chat',
        SCENARIO_THREE_IMAGES['shop-chat'],
        '상황 3 UI 시안'
      );
  }
}

function buildScenarioThreeImageOption(variant, src, alt) {
  const { root, frame } = createScenarioThreeShell(variant, alt);

  const image = document.createElement('img');
  image.className = 's1-prototype-image';
  image.src = src;
  image.alt = alt;
  image.draggable = false;
  image.addEventListener('load', () => fitScenarioOneImage(frame, image));

  frame.appendChild(image);
  return root;
}

function buildScenarioThreeChecklist() {
  const { root, frame } = createScenarioThreeShell(
    'shop-checklist',
    '상점 패키지 구매 체크리스트',
    650,
    860
  );

  frame.classList.add('s2-ui-frame', 's3-checklist-frame');
  frame.innerHTML = `
    <article class="s3-checklist-panel">
      <header class="s3-checklist-header">
        <button type="button" data-no-drag aria-label="닫기">›</button>
        <div>새로 나온 라떼맛 쿠키 건축 패키지 사서 써보고싶어</div>
      </header>

      <div class="s3-checklist-list" role="group" aria-label="상점 패키지 구매 단계">
        ${[
          ['홈 화면에서 좌측 상단 상점 버튼 터치', true],
          ['‘왕국 레벨 달성 패키지’ 터치', true],
          ['오른쪽으로 스크롤', false],
          ['‘라떼맛 쿠키의 사르르 라떼 아틀리에’ 패키지 구매', false],
          ['홈 화면으로 복귀', false],
          ['왼쪽 아래 ‘건설’ 버튼 클릭', false],
          ['구매했던 물품 있는지 확인 후 건설 시작', false]
        ].map(([label, checked]) => `
          <label class="s3-check-item ${checked ? 'checked' : ''}">
            <input type="checkbox" data-no-drag ${checked ? 'checked' : ''}>
            <span class="s3-check-box" aria-hidden="true"></span>
            <span class="s3-check-text">${label}</span>
          </label>
        `).join('')}
      </div>

      <p class="s3-check-progress" aria-live="polite"></p>
    </article>`;

  frame.querySelector('.s3-checklist-header button').addEventListener('click', () => {
    hideScenarioOneImage(root);
  });

  const items = Array.from(frame.querySelectorAll('.s3-check-item'));
  const update = () => {
    const completed = items.filter(item => item.querySelector('input').checked).length;
    items.forEach(item => item.classList.toggle('checked', item.querySelector('input').checked));
    frame.querySelector('.s3-check-progress').textContent =
      `${completed} / ${items.length} 단계 완료`;
  };

  items.forEach(item => {
    item.querySelector('input').addEventListener('change', () => {
      update();
      emitEvent('scenario_three_checklist_toggled');
    });
  });

  update();
  return root;
}

function buildScenarioThreeHighlight() {
  const { root, frame } = createScenarioThreeShell(
    'shop-highlight',
    '상점 위치 화면 하이라이팅',
    960,
    620
  );

  frame.classList.add('s3-highlight-frame');
  frame.dataset.workshopTap = 'true';
  frame.dataset.view = 'home';

  const image = document.createElement('img');
  image.className = 's1-prototype-image s3-highlight-image';
  image.src = SCENARIO_THREE_IMAGES['shop-highlight-home'];
  image.alt = '홈 화면의 상점 버튼을 하이라이트한 안내. 클릭하면 상점 패키지 위치를 표시합니다.';
  image.draggable = false;
  image.addEventListener('load', () => fitScenarioOneImage(frame, image));

  frame.addEventListener('workshoptap', () => {
    const showingShop = frame.dataset.view === 'shop';
    frame.dataset.view = showingShop ? 'home' : 'shop';
    image.src = showingShop
      ? SCENARIO_THREE_IMAGES['shop-highlight-home']
      : SCENARIO_THREE_IMAGES['shop-highlight-shop'];
    image.alt = showingShop
      ? '홈 화면의 상점 버튼을 하이라이트한 안내'
      : '상점 화면의 왕국 레벨 달성 패키지를 하이라이트한 안내';
    emitEvent(showingShop
      ? 'scenario_three_highlight_home_shown'
      : 'scenario_three_highlight_shop_shown');
  });

  frame.appendChild(image);
  return root;
}



/* ── 상황 5: 전투 정보 접근성 UI 3종 ─────────────────────────────────── */
const SCENARIO_FIVE_VARIANTS = [
  'combat-popup',
  'combat-sidepanel',
  'combat-filter'
];

const SCENARIO_FIVE_TITLES = {
  'combat-popup': '팝업형(전맹/청각장애인용)',
  'combat-sidepanel': '사이드패널형(전맹/청각장애인용)',
  'combat-filter': '필터형(저시력용)'
};

const SCENARIO_FIVE_IMAGES = {
  'combat-popup': '/images/scenario5-popup.png',
  'combat-sidepanel': '/images/scenario5-sidepanel.png',
  'combat-filter-default': '/images/scenario5-filter-default.png',
  'combat-filter-applied': '/images/scenario5-filter-applied.png'
};

function getScenarioFiveVariant(scenario, option) {
  if (SCENARIO_FIVE_VARIANTS.includes(option?.workshopVariant)) {
    return option.workshopVariant;
  }

  if (!scenario?.isWorkshopScenarioFive || !Array.isArray(scenario.options)) return null;
  const optionIndex = scenario.options.findIndex(item => item.id === option?.id);
  return SCENARIO_FIVE_VARIANTS[optionIndex] || null;
}

function buildScenarioFiveOption(variant) {
  if (variant === 'combat-popup') {
    return buildScenarioFiveImageOption(
      variant,
      SCENARIO_FIVE_IMAGES['combat-popup'],
      '상황 5 팝업형 전투 정보 UI'
    );
  }

  if (variant === 'combat-sidepanel') {
    return buildScenarioFiveInteractiveSidePanel();
  }

  return buildScenarioFiveFilter();
}

function buildScenarioFiveImageOption(variant, src, alt) {
  const { root, frame } = createScenarioTwoShell(variant, alt, 820, 760);
  root.classList.add('ui-s5-option');

  const image = document.createElement('img');
  image.className = 's1-prototype-image';
  image.src = src;
  image.alt = alt;
  image.draggable = false;
  image.addEventListener('load', () => fitScenarioOneImage(frame, image));

  frame.appendChild(image);
  return root;
}


function buildScenarioFiveInteractiveSidePanel() {
  const { root, frame } = createScenarioTwoShell(
    'combat-sidepanel',
    '전투 상황 실시간 사이드패널',
    640,
    900
  );

  root.classList.add('ui-s5-option');
  frame.classList.add('s5-sidepanel-frame', 's2-ui-frame');

  const events = [
    { time: '10:28:41', type: 'enemy', tone: 'danger', text: '적1 사망' },
    { time: '10:28:43', type: 'dialogue', tone: 'ally', text: '플레이어 3: 순찰 돌고 올게요' },
    { time: '10:28:52', type: 'skill', tone: 'neutral', text: '플레이어 2가 스킬을 씀' },
    { time: '10:29:03', type: 'enemy', tone: 'danger', text: '적2 사망' },
    { time: '10:29:13', type: 'skill', tone: 'neutral', text: '적 3가 스킬을 씀' },
    { time: '10:29:14', type: 'dialogue', tone: 'ally', text: '플레이어 2: 왼쪽에 스나이퍼' },
    { time: '10:29:23', type: 'environment', tone: 'neutral', text: '좌측상단 15도에서 총소리' },
    { time: '10:29:32', type: 'environment', tone: 'neutral', text: '오른쪽 먼 곳에서 발소리' },
    { time: '10:29:36', type: 'timer', tone: 'neutral', text: '안전 구역 축소까지 01:01' },
    { time: '10:29:40', type: 'ai', tone: 'ai', text: 'AI 설명: 엄폐물 뒤 적 1명, 좌측 접근 권장' }
  ];

  const filters = [
    ['dialogue', '대화'],
    ['timer', '타이머'],
    ['enemy', '적 위치'],
    ['environment', '환경 소리'],
    ['skill', '스킬'],
    ['ai', 'AI 상황 설명']
  ];

  frame.innerHTML = `
    <article class="s5-live-panel">
      <header class="s5-live-header">
        <button type="button" class="s5-live-close" data-no-drag aria-label="닫기">›</button>
        <div>
          <h2>실시간 상황 기록</h2>
          <p>필터를 눌러 필요한 정보만 표시할 수 있어요.</p>
        </div>
      </header>

      <div class="s5-event-list" aria-live="polite">
        ${events.map(event => `
          <div class="s5-event-row" data-category="${event.type}">
            <time>${event.time}</time>
            <span class="s5-event-dot ${event.tone}" aria-hidden="true"></span>
            <span class="s5-event-text">${event.text}</span>
          </div>
        `).join('')}
      </div>

      <footer class="s5-filter-area">
        <span class="s5-filter-label">자막 필터</span>
        <div class="s5-filter-buttons" role="group" aria-label="상황 자막 필터">
          ${filters.map(([value, label]) => `
            <button type="button"
                    class="s5-filter-chip ${['dialogue', 'enemy', 'skill'].includes(value) ? 'active' : ''}"
                    data-filter="${value}"
                    data-no-drag
                    aria-pressed="${['dialogue', 'enemy', 'skill'].includes(value)}">
              ${label}
            </button>
          `).join('')}
        </div>
        <p class="s5-filter-status" aria-live="polite"></p>
      </footer>
    </article>`;

  frame.querySelector('.s5-live-close').addEventListener('click', () => {
    hideScenarioOneImage(root);
  });

  const chips = Array.from(frame.querySelectorAll('.s5-filter-chip'));
  const rows = Array.from(frame.querySelectorAll('.s5-event-row'));

  const applyFilters = () => {
    const activeFilters = chips
      .filter(chip => chip.getAttribute('aria-pressed') === 'true')
      .map(chip => chip.dataset.filter);

    rows.forEach(row => {
      row.hidden = activeFilters.length > 0
        && !activeFilters.includes(row.dataset.category);
    });

    const visibleCount = rows.filter(row => !row.hidden).length;
    frame.querySelector('.s5-filter-status').textContent = activeFilters.length
      ? `${activeFilters.length}개 필터 · ${visibleCount}개 기록 표시`
      : `필터 없음 · 전체 ${rows.length}개 기록 표시`;
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const next = chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', String(next));
      chip.classList.toggle('active', next);
      applyFilters();
      emitEvent('scenario_five_caption_filter_toggled');
    });
  });

  applyFilters();
  return root;
}


function buildScenarioFiveFilter() {
  const { root, frame } = createScenarioTwoShell(
    'combat-filter',
    '저시력용 전투 화면 필터',
    960,
    560
  );

  root.classList.add('ui-s5-option');
  frame.classList.add('s5-filter-frame');
  frame.dataset.workshopTap = 'true';
  frame.dataset.view = 'default';

  const image = document.createElement('img');
  image.className = 's1-prototype-image';
  image.src = SCENARIO_FIVE_IMAGES['combat-filter-default'];
  image.alt = '일반 전투 화면. 클릭하면 저시력용 고대비 필터 화면을 표시합니다.';
  image.draggable = false;
  image.addEventListener('load', () => fitScenarioOneImage(frame, image));

  frame.addEventListener('workshoptap', () => {
    const applied = frame.dataset.view === 'applied';
    frame.dataset.view = applied ? 'default' : 'applied';
    image.src = applied
      ? SCENARIO_FIVE_IMAGES['combat-filter-default']
      : SCENARIO_FIVE_IMAGES['combat-filter-applied'];
    image.alt = applied
      ? '일반 전투 화면'
      : '저시력용 고대비 필터가 적용된 전투 화면';
    emitEvent(applied
      ? 'scenario_five_filter_disabled'
      : 'scenario_five_filter_enabled');
  });

  frame.appendChild(image);
  return root;
}



/* ── 상황 7: 스테이지 공략 및 조합 추천 UI 3종 ───────────────────────── */
const SCENARIO_SEVEN_VARIANTS = [
  'strategy-chat',
  'strategy-popup',
  'strategy-links'
];

const SCENARIO_SEVEN_TITLES = {
  'strategy-chat': '채팅형',
  'strategy-popup': '추천팝업형',
  'strategy-links': '외부링크추천형'
};

const SCENARIO_SEVEN_IMAGES = {
  'strategy-chat': '/images/scenario7-chat.png',
  'strategy-popup': '/images/scenario7-recommend-popup.png',
  'strategy-links': '/images/scenario7-external-links.png'
};

function getScenarioSevenVariant(scenario, option) {
  if (SCENARIO_SEVEN_VARIANTS.includes(option?.workshopVariant)) {
    return option.workshopVariant;
  }

  if (!scenario?.isWorkshopScenarioSeven || !Array.isArray(scenario.options)) return null;
  const optionIndex = scenario.options.findIndex(item => item.id === option?.id);
  return SCENARIO_SEVEN_VARIANTS[optionIndex] || null;
}

function buildScenarioSevenOption(variant) {
  if (variant === 'strategy-links') return buildScenarioSevenScrollableLinks();

  const src = SCENARIO_SEVEN_IMAGES[variant] || SCENARIO_SEVEN_IMAGES['strategy-chat'];
  const alt = variant === 'strategy-popup'
    ? '상황 7 추천 팝업형 조합 안내'
    : '상황 7 채팅형 공략 안내';

  const { root, frame } = createScenarioTwoShell(variant, alt, 900, 760);
  root.classList.add('ui-s7-option');

  const image = document.createElement('img');
  image.className = 's1-prototype-image';
  image.src = src;
  image.alt = alt;
  image.draggable = false;
  image.addEventListener('load', () => fitScenarioOneImage(frame, image));

  frame.appendChild(image);
  return root;
}

function buildScenarioSevenScrollableLinks() {
  const { root, frame } = createScenarioTwoShell(
    'strategy-links',
    '외부 공략 링크 추천 목록',
    760,
    860
  );

  root.classList.add('ui-s7-option');
  frame.classList.add('s7-scroll-frame');

  const viewport = document.createElement('div');
  viewport.className = 's7-scroll-viewport';
  viewport.setAttribute('data-no-drag', '');
  viewport.setAttribute('tabindex', '0');
  viewport.setAttribute('aria-label', '외부 링크 추천 내용을 위아래로 스크롤');

  const image = document.createElement('img');
  image.className = 's7-scroll-image';
  image.src = SCENARIO_SEVEN_IMAGES['strategy-links'];
  image.alt = '3-14 스테이지 외부 공략 링크 추천 목록';
  image.draggable = false;

  viewport.addEventListener('scroll', () => {
    emitEvent('scenario_seven_external_links_scrolled');
  }, { passive: true });

  viewport.appendChild(image);
  frame.appendChild(viewport);
  return root;
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

