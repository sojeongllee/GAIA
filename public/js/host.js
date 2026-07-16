/* ── State ──────────────────────────────────────────────────────────────── */
let categories       = [];
let scenarios        = [];
let selectedScenario = null;
let selectedOption   = null;
let activeScenario   = null;
let activeOption     = null;
let allNotes         = {};
let surveyDirty      = false;
let loadingSurvey    = false;

/* ── Socket ─────────────────────────────────────────────────────────────── */
const socket = io({ query: { role: 'host' } });

socket.on('participant-count', n => {
  document.getElementById('participant-count').textContent = n;
});

socket.on('current-state', state => {
  activeScenario = state.scenario;
  const workshop = getWorkshopVariant(state.scenario, state.option);
  activeOption = workshop
    ? { ...state.option, title: workshop.title, workshopVariant: workshop.variant }
    : state.option;
  refreshActiveInfo();
  refreshOptionCards();
});

socket.on('all-notes', notesObj => {
  allNotes = notesObj || {};
  refreshScenarioSurvey();
});

socket.on('note-updated', ({ key, text }) => {
  allNotes[key] = text;
  if (currentSurveyKey() === key && !surveyDirty) {
    refreshScenarioSurvey(true);
  }
});

/* ── Load scenarios ──────────────────────────────────────────────────────── */
fetch('/api/scenarios')
  .then(r => r.json())
  .then(data => {
    categories = data.categories;
    scenarios  = data.scenarios;
    prepareWorkshopScenarios();
    renderScenarioList();
  });


/* ── 상황 1·2·3·5·7 워크숍 전용 UI 매핑 ───────────────────────────────── */
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

function normalizeScenarioOneVariant(variant) {
  return SCENARIO_ONE_ALIASES[variant] || variant;
}

function isScenarioOne(sc) {
  if (!sc) return false;
  return sc.isWorkshopScenarioOne === true || scenarios[0]?.id === sc.id;
}

function isScenarioTwo(sc) {
  if (!sc) return false;
  return sc.isWorkshopScenarioTwo === true || scenarios[1]?.id === sc.id;
}

function isScenarioThree(sc) {
  if (!sc) return false;
  return sc.isWorkshopScenarioThree === true || scenarios[2]?.id === sc.id;
}

function isScenarioFive(sc) {
  if (!sc) return false;
  return sc.isWorkshopScenarioFive === true || scenarios[4]?.id === sc.id;
}

function isScenarioSeven(sc) {
  if (!sc) return false;
  return sc.isWorkshopScenarioSeven === true || scenarios[6]?.id === sc.id;
}

function getScenarioOneVariant(sc, opt) {
  const explicitVariant = normalizeScenarioOneVariant(opt?.workshopVariant);
  if (SCENARIO_ONE_VARIANTS.includes(explicitVariant)) return explicitVariant;

  if (!isScenarioOne(sc) || !Array.isArray(sc.options)) return null;
  const optionIndex = sc.options.findIndex(item => item.id === opt?.id);
  return SCENARIO_ONE_VARIANTS[optionIndex] || null;
}

function getScenarioTwoVariant(sc, opt) {
  if (SCENARIO_TWO_VARIANTS.includes(opt?.workshopVariant)) {
    return opt.workshopVariant;
  }

  if (!isScenarioTwo(sc) || !Array.isArray(sc.options)) return null;
  const optionIndex = sc.options.findIndex(item => item.id === opt?.id);
  return SCENARIO_TWO_VARIANTS[optionIndex] || null;
}

function getScenarioThreeVariant(sc, opt) {
  if (SCENARIO_THREE_VARIANTS.includes(opt?.workshopVariant)) {
    return opt.workshopVariant;
  }

  if (!isScenarioThree(sc) || !Array.isArray(sc.options)) return null;
  const optionIndex = sc.options.findIndex(item => item.id === opt?.id);
  return SCENARIO_THREE_VARIANTS[optionIndex] || null;
}

function getScenarioFiveVariant(sc, opt) {
  if (SCENARIO_FIVE_VARIANTS.includes(opt?.workshopVariant)) {
    return opt.workshopVariant;
  }

  if (!isScenarioFive(sc) || !Array.isArray(sc.options)) return null;
  const optionIndex = sc.options.findIndex(item => item.id === opt?.id);
  return SCENARIO_FIVE_VARIANTS[optionIndex] || null;
}

function getScenarioSevenVariant(sc, opt) {
  if (SCENARIO_SEVEN_VARIANTS.includes(opt?.workshopVariant)) {
    return opt.workshopVariant;
  }

  if (!isScenarioSeven(sc) || !Array.isArray(sc.options)) return null;
  const optionIndex = sc.options.findIndex(item => item.id === opt?.id);
  return SCENARIO_SEVEN_VARIANTS[optionIndex] || null;
}

function getWorkshopVariant(sc, opt) {
  const scenarioOneVariant = getScenarioOneVariant(sc, opt);
  if (scenarioOneVariant) {
    return {
      scenarioNumber: 1,
      variant: scenarioOneVariant,
      title: SCENARIO_ONE_TITLES[scenarioOneVariant],
      label: '업로드 이미지'
    };
  }

  const scenarioTwoVariant = getScenarioTwoVariant(sc, opt);
  if (scenarioTwoVariant) {
    const label = ['setup-manual', 'setup-checklist', 'setup-cards'].includes(scenarioTwoVariant)
      ? '인터랙티브 UI'
      : scenarioTwoVariant === 'setup-auto'
        ? '클릭형 이미지'
        : '업로드 이미지';

    return {
      scenarioNumber: 2,
      variant: scenarioTwoVariant,
      title: SCENARIO_TWO_TITLES[scenarioTwoVariant],
      label
    };
  }

  const scenarioThreeVariant = getScenarioThreeVariant(sc, opt);
  if (scenarioThreeVariant) {
    const label = scenarioThreeVariant === 'shop-checklist'
      ? '인터랙티브 UI'
      : scenarioThreeVariant === 'shop-highlight'
        ? '클릭형 이미지'
        : '업로드 이미지';

    return {
      scenarioNumber: 3,
      variant: scenarioThreeVariant,
      title: SCENARIO_THREE_TITLES[scenarioThreeVariant],
      label
    };
  }

  const scenarioFiveVariant = getScenarioFiveVariant(sc, opt);
  if (scenarioFiveVariant) {
    return {
      scenarioNumber: 5,
      variant: scenarioFiveVariant,
      title: SCENARIO_FIVE_TITLES[scenarioFiveVariant],
      label: scenarioFiveVariant === 'combat-sidepanel'
        ? '인터랙티브 UI'
        : scenarioFiveVariant === 'combat-filter'
          ? '클릭형 이미지'
          : '업로드 이미지'
    };
  }

  const scenarioSevenVariant = getScenarioSevenVariant(sc, opt);
  if (scenarioSevenVariant) {
    return {
      scenarioNumber: 7,
      variant: scenarioSevenVariant,
      title: SCENARIO_SEVEN_TITLES[scenarioSevenVariant],
      label: scenarioSevenVariant === 'strategy-links'
        ? '스크롤 이미지'
        : '업로드 이미지'
    };
  }

  return null;
}

function getWorkshopTitle(sc, opt) {
  return getWorkshopVariant(sc, opt)?.title || opt?.title;
}

function getWorkshopLabel(sc, opt) {
  return getWorkshopVariant(sc, opt)?.label || opt?.type;
}

function withWorkshopVariant(sc, opt) {
  const workshop = getWorkshopVariant(sc, opt);
  if (!workshop) return { scenario: sc, option: opt };

  return {
    scenario: {
      ...sc,
      ...(workshop.scenarioNumber === 1
        ? { isWorkshopScenarioOne: true }
        : workshop.scenarioNumber === 2
          ? { isWorkshopScenarioTwo: true }
          : workshop.scenarioNumber === 3
            ? { isWorkshopScenarioThree: true }
            : workshop.scenarioNumber === 5
              ? { isWorkshopScenarioFive: true }
              : { isWorkshopScenarioSeven: true })
    },
    option: {
      ...opt,
      title: workshop.title,
      workshopVariant: workshop.variant
    }
  };
}

function prepareWorkshopScenarios() {
  const configure = (scenario, variants, titles, type, flagName) => {
    if (!scenario) return;
    scenario[flagName] = true;
    const sourceOptions = Array.isArray(scenario.options) ? scenario.options : [];

    scenario.options = variants.map((variant, index) => {
      const source = sourceOptions[index] || {};
      return {
        ...source,
        id: source.id || `${scenario.id}-workshop-option-${index + 1}`,
        title: titles[variant],
        type,
        workshopVariant: variant,
        content: source.content || {}
      };
    });
  };

  configure(
    scenarios[0],
    SCENARIO_ONE_VARIANTS,
    SCENARIO_ONE_TITLES,
    'workshop-scenario-one',
    'isWorkshopScenarioOne'
  );

  configure(
    scenarios[1],
    SCENARIO_TWO_VARIANTS,
    SCENARIO_TWO_TITLES,
    'workshop-scenario-two',
    'isWorkshopScenarioTwo'
  );

  configure(
    scenarios[2],
    SCENARIO_THREE_VARIANTS,
    SCENARIO_THREE_TITLES,
    'workshop-scenario-three',
    'isWorkshopScenarioThree'
  );

  configure(
    scenarios[4],
    SCENARIO_FIVE_VARIANTS,
    SCENARIO_FIVE_TITLES,
    'workshop-scenario-five',
    'isWorkshopScenarioFive'
  );

  configure(
    scenarios[6],
    SCENARIO_SEVEN_VARIANTS,
    SCENARIO_SEVEN_TITLES,
    'workshop-scenario-seven',
    'isWorkshopScenarioSeven'
  );
}

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
  if (surveyDirty && selectedScenario && selectedScenario.id !== sc.id) {
    const discard = window.confirm('저장하지 않은 상황 응답이 있습니다. 변경 내용을 버리고 다른 시나리오로 이동할까요?');
    if (!discard) return;
  }

  selectedScenario = sc;
  selectedOption   = null;
  surveyDirty      = false;

  document.querySelectorAll('.scenario-item').forEach(el =>
    el.classList.toggle('selected', el.dataset.id === sc.id)
  );

  document.getElementById('btn-show').disabled = true;
  renderOptionCards();
  refreshScenarioSurvey(true);
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
    const displayType = getWorkshopLabel(selectedScenario, opt);
    card.className = 'option-card' + (isActive ? ' active-shown' : '');
    card.dataset.id = opt.id;
    card.innerHTML = `
      <div class="opt-title">${getWorkshopTitle(selectedScenario, opt)}</div>
      <div class="opt-badges">
        <span class="opt-type">${displayType}</span>
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
}

/* ── Show to participant ─────────────────────────────────────────────────── */
function showToParticipant() {
  if (!selectedScenario || !selectedOption) return;
  const payload = withWorkshopVariant(selectedScenario, selectedOption);
  socket.emit('show-ui', {
    scenarioId: selectedScenario.id,
    optionId:   selectedOption.id,
    scenario:   payload.scenario,
    option:     payload.option
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

/* ── Scenario-level interviewer survey ────────────────────────────────────── */
const SURVEY_KEY_PREFIX = 'scenario-survey:';

const AI_FUNCTION_OPTIONS = [
  '화면 텍스트 읽기 / OCR',
  '실시간 상황 설명',
  '소리 시각화 / 자막화',
  '보이스채팅 자막 변환',
  '길찾기 / 퀘스트 안내',
  '힌트 / 공략 제공',
  '스토리 / 대화 요약',
  '접근성 설정 추천',
  '키 리매핑 / 대체 입력 지원',
  '조작 보조 / 부분 대행',
  '게임 추천 / 접근성 정보 제공',
  '게임 설치 및 세팅 지원'
];

const DELIVERY_MODE_OPTIONS = [
  '음성 안내',
  '텍스트 자막',
  '화면 오버레이',
  '작은 팝업',
  '사이드 패널',
  '진동 / 촉각 피드백',
  '대화형 챗봇',
  '버튼을 눌렀을 때만 실행',
  '자동 실행'
];

const INTERVENTION_OPTIONS = [
  '정보만 제공',
  '추천만 제공',
  '사용자가 허락하면 실행',
  '일부 조작을 대신 수행',
  '완전히 자동으로 수행',
  '상황에 따라 다름'
];

const DISCOMFORT_OPTIONS = [
  '화면을 가림',
  '정보가 너무 많음',
  '소리가 겹침',
  '반응이 느리면 불편함',
  '내가 직접 플레이하는 느낌이 줄어듦',
  '치팅처럼 느껴질 수 있음',
  '사용법이 복잡할 수 있음',
  '특별한 불편은 없음'
];

function currentSurveyKey() {
  return selectedScenario ? `${SURVEY_KEY_PREFIX}${selectedScenario.id}` : null;
}

function createChoiceMarkup(name, values, type = 'checkbox') {
  return values.map((value, index) => `
    <label class="survey-choice">
      <input type="${type}" name="${name}" value="${escapeHtml(value)}">
      <span>${escapeHtml(value)}</span>
    </label>
  `).join('');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initializeSurveyChoices() {
  document.getElementById('q2-function-options').innerHTML =
    createChoiceMarkup('q2Functions', AI_FUNCTION_OPTIONS);

  document.getElementById('q5-mode-options').innerHTML =
    createChoiceMarkup('q5Modes', DELIVERY_MODE_OPTIONS);

  document.getElementById('q8-intervention-options').innerHTML =
    createChoiceMarkup('q8Intervention', INTERVENTION_OPTIONS, 'radio');

  document.getElementById('q10-discomfort-options').innerHTML =
    createChoiceMarkup('q10Discomforts', DISCOMFORT_OPTIONS);

  const select = document.getElementById('q3MostImportant');
  select.innerHTML = '<option value="">선택하세요</option>'
    + AI_FUNCTION_OPTIONS.map(value =>
        `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`
      ).join('')
    + '<option value="기타">기타</option>';

  select.addEventListener('change', updateQ3OtherVisibility);
}

function renderScenarioUiChoices(selectedValue = '') {
  const container = document.getElementById('q6-ui-options');
  if (!selectedScenario) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = selectedScenario.options.map(opt => {
    const title = getWorkshopTitle(selectedScenario, opt);
    return `
      <label class="survey-choice">
        <input type="radio" name="q6BestUi" value="${escapeHtml(title)}"
               ${title === selectedValue ? 'checked' : ''}>
        <span>${escapeHtml(title)}</span>
      </label>`;
  }).join('');
}

function parseSurveyRecord(text) {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('상황 응답 JSON을 읽을 수 없습니다.', error);
    return {};
  }
}

function normalizeSurveyRecord(record = {}) {
  if (!record || typeof record !== 'object' || Object.keys(record).length === 0) {
    return {};
  }

  if (Number(record.schemaVersion) >= 2) return record;

  // 이전 3–13번 필드로 저장된 데이터도 새 1–11번 폼에서 읽습니다.
  return {
    schemaVersion: 2,
    scenarioId: record.scenarioId,
    scenarioTitle: record.scenarioTitle,
    q1Frequency: record.q3Frequency ?? '',
    q2Functions: record.q4Functions ?? [],
    q2Other: record.q4Other ?? '',
    q3MostImportant: record.q5MostImportant ?? '',
    q3Other: record.q5Other ?? '',
    q4Reason: record.q6Reason ?? '',
    q5Modes: record.q7Modes ?? [],
    q5Other: record.q7Other ?? '',
    q6BestUi: record.q8BestUi ?? '',
    q7Reason: record.q9Reason ?? '',
    q8Intervention: record.q10Intervention ?? '',
    q9Reason: record.q11Reason ?? '',
    q10Discomforts: record.q12Discomforts ?? [],
    q10Other: record.q12Other ?? '',
    q11Additional: record.q13Additional ?? '',
    updatedAt: record.updatedAt
  };
}

function setCheckedValues(name, values = []) {
  const selected = new Set(Array.isArray(values) ? values : []);
  document.querySelectorAll(`[name="${name}"]`).forEach(input => {
    input.checked = selected.has(input.value);
  });
}

function setRadioValue(name, value = '') {
  document.querySelectorAll(`[name="${name}"]`).forEach(input => {
    input.checked = input.value === String(value ?? '');
  });
}

function setInputValue(id, value = '') {
  const el = document.getElementById(id);
  if (el) el.value = value ?? '';
}

function updateQ3OtherVisibility() {
  const field = document.querySelector('.q3-other-field');
  const isOther = document.getElementById('q3MostImportant').value === '기타';
  field.hidden = !isOther;
  if (!isOther && !loadingSurvey) document.getElementById('q3Other').value = '';
}

function refreshScenarioSurvey(force = false) {
  const form = document.getElementById('scenario-survey-form');
  const empty = document.getElementById('survey-empty');
  const label = document.getElementById('survey-scenario-label');

  if (!selectedScenario) {
    form.hidden = true;
    empty.hidden = false;
    label.textContent = '시나리오를 선택하세요';
    return;
  }

  if (surveyDirty && !force) return;

  const record = normalizeSurveyRecord(parseSurveyRecord(allNotes[currentSurveyKey()]));
  loadingSurvey = true;

  empty.hidden = true;
  form.hidden = false;
  label.textContent = selectedScenario.title;

  form.reset();
  renderScenarioUiChoices(record.q6BestUi || '');

  setRadioValue('q1Frequency', record.q1Frequency);
  setCheckedValues('q2Functions', record.q2Functions);
  setInputValue('q2Other', record.q2Other);
  setInputValue('q3MostImportant', record.q3MostImportant);
  setInputValue('q3Other', record.q3Other);
  setInputValue('q4Reason', record.q4Reason);
  setCheckedValues('q5Modes', record.q5Modes);
  setInputValue('q5Other', record.q5Other);
  setRadioValue('q6BestUi', record.q6BestUi);
  setInputValue('q7Reason', record.q7Reason);
  setRadioValue('q8Intervention', record.q8Intervention);
  setInputValue('q9Reason', record.q9Reason);
  setCheckedValues('q10Discomforts', record.q10Discomforts);
  setInputValue('q10Other', record.q10Other);
  setInputValue('q11Additional', record.q11Additional);

  updateQ3OtherVisibility();
  loadingSurvey = false;
  setSurveyDirty(false);

  const status = document.getElementById('survey-save-status');
  status.textContent = record.updatedAt
    ? `마지막 저장: ${new Date(record.updatedAt).toLocaleString('ko-KR')}`
    : '아직 저장된 응답이 없습니다.';
}

function checkedValues(name) {
  return Array.from(document.querySelectorAll(`[name="${name}"]:checked`))
    .map(input => input.value);
}

function radioValue(name) {
  return document.querySelector(`[name="${name}"]:checked`)?.value || '';
}

function collectScenarioSurvey() {
  return {
    schemaVersion: 2,
    scenarioId: selectedScenario.id,
    scenarioTitle: selectedScenario.title,
    q1Frequency: radioValue('q1Frequency'),
    q2Functions: checkedValues('q2Functions'),
    q2Other: document.getElementById('q2Other').value.trim(),
    q3MostImportant: document.getElementById('q3MostImportant').value,
    q3Other: document.getElementById('q3Other').value.trim(),
    q4Reason: document.getElementById('q4Reason').value.trim(),
    q5Modes: checkedValues('q5Modes'),
    q5Other: document.getElementById('q5Other').value.trim(),
    q6BestUi: radioValue('q6BestUi'),
    q7Reason: document.getElementById('q7Reason').value.trim(),
    q8Intervention: radioValue('q8Intervention'),
    q9Reason: document.getElementById('q9Reason').value.trim(),
    q10Discomforts: checkedValues('q10Discomforts'),
    q10Other: document.getElementById('q10Other').value.trim(),
    q11Additional: document.getElementById('q11Additional').value.trim(),
    updatedAt: new Date().toISOString()
  };
}

function setSurveyDirty(isDirty) {
  surveyDirty = isDirty;
  const button = document.getElementById('survey-save-btn');
  if (button) button.disabled = !isDirty || !selectedScenario;
}

function markSurveyDirty() {
  if (loadingSurvey || !selectedScenario) return;
  setSurveyDirty(true);
  document.getElementById('survey-save-status').textContent = '저장되지 않은 변경 사항이 있습니다.';
  updateQ3OtherVisibility();
}

function saveScenarioSurvey() {
  if (!selectedScenario) return;

  const key = currentSurveyKey();
  const record = collectScenarioSurvey();
  const text = JSON.stringify(record);

  allNotes[key] = text;
  socket.emit('update-note', { key, text });

  setSurveyDirty(false);
  document.getElementById('survey-save-status').textContent =
    `저장 완료: ${new Date(record.updatedAt).toLocaleString('ko-KR')}`;
}

function getSavedScenarioSurveys() {
  return scenarios.map(scenario => {
    const rawRecord = parseSurveyRecord(allNotes[`${SURVEY_KEY_PREFIX}${scenario.id}`]);
    const record = normalizeSurveyRecord(rawRecord);
    return Object.keys(record).length
      ? record
      : { scenarioId: scenario.id, scenarioTitle: scenario.title };
  });
}

function downloadTextFile(filename, contents, mimeType) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function exportScenarioSurveysJSON() {
  const payload = {
    exportedAt: new Date().toISOString(),
    responses: getSavedScenarioSurveys()
  };
  downloadTextFile(
    'gaia-scenario-responses.json',
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8'
  );
}

function csvEscape(value) {
  const normalized = Array.isArray(value) ? value.join(' | ') : String(value ?? '');
  return `"${normalized.replaceAll('"', '""')}"`;
}

function exportScenarioSurveysCSV() {
  const fields = [
    ['scenarioId', '시나리오 ID'],
    ['scenarioTitle', '시나리오'],
    ['q1Frequency', '1. 경험 빈도'],
    ['q2Functions', '2. 필요한 AI 기능'],
    ['q2Other', '2. 기타 기능'],
    ['q3MostImportant', '3. 가장 중요한 기능'],
    ['q3Other', '3. 기타 중요 기능'],
    ['q4Reason', '4. 중요 이유'],
    ['q5Modes', '5. 제공 방식'],
    ['q5Other', '5. 기타 제공 방식'],
    ['q6BestUi', '6. 가장 적절한 UI'],
    ['q7Reason', '7. UI 선택 이유'],
    ['q8Intervention', '8. AI 개입 수준'],
    ['q9Reason', '9. 개입 수준 이유'],
    ['q10Discomforts', '10. 불편할 수 있는 점'],
    ['q10Other', '10. 기타 불편'],
    ['q11Additional', '11. 추가 의견'],
    ['updatedAt', '저장 시각']
  ];

  const rows = [
    fields.map(([, label]) => csvEscape(label)).join(','),
    ...getSavedScenarioSurveys().map(record =>
      fields.map(([key]) => csvEscape(record[key])).join(',')
    )
  ];

  downloadTextFile(
    'gaia-scenario-responses.csv',
    '\ufeff' + rows.join('\n'),
    'text/csv;charset=utf-8'
  );
}

window.addEventListener('beforeunload', event => {
  if (!surveyDirty) return;
  event.preventDefault();
  event.returnValue = '';
});

initializeSurveyChoices();

/* ── Live participant view ───────────────────────────────────────────────── */
function renderLiveView(option, scenario = activeScenario) {
  const waiting = document.getElementById('live-view-waiting');
  const content = document.getElementById('live-view-content');

  if (!option) {
    waiting.style.display = 'flex';
    content.innerHTML = '';
    return;
  }

  waiting.style.display = 'none';
  content.innerHTML = buildPreviewUI(option, scenario);
  initializeScenarioTwoPreview(content, getScenarioTwoVariant(scenario, option));
}

/* ── Preview modal ───────────────────────────────────────────────────────── */
function openPreview(event, optionId) {
  event.stopPropagation();
  if (!selectedScenario) return;

  const opt = selectedScenario.options.find(o => o.id === optionId);
  if (!opt) return;

  document.getElementById('preview-title').textContent = getWorkshopTitle(selectedScenario, opt);
  document.getElementById('preview-type-badge').textContent = getWorkshopLabel(selectedScenario, opt);
  const previewContent = document.getElementById('preview-ui-content');
  previewContent.innerHTML = buildPreviewUI(opt, selectedScenario);
  initializeScenarioTwoPreview(previewContent, getScenarioTwoVariant(selectedScenario, opt));
  initializeScenarioThreePreview(previewContent, getScenarioThreeVariant(selectedScenario, opt));
  initializeScenarioFivePreview(previewContent, getScenarioFiveVariant(selectedScenario, opt));
  initializeScenarioSevenPreview(previewContent, getScenarioSevenVariant(selectedScenario, opt));
  document.getElementById('preview-modal').classList.add('open');
}

function closePreviewBtn() {
  document.getElementById('preview-modal').classList.remove('open');
}

function closePreview(e) {
  if (e.target === document.getElementById('preview-modal')) closePreviewBtn();
}

function buildPreviewUI(opt, scenario = selectedScenario) {
  const scenarioOneVariant = getScenarioOneVariant(scenario, opt);
  if (scenarioOneVariant) return buildScenarioOnePreview(scenarioOneVariant, scenario, opt);

  const scenarioTwoVariant = getScenarioTwoVariant(scenario, opt);
  if (scenarioTwoVariant) return buildScenarioTwoPreview(scenarioTwoVariant);

  const scenarioThreeVariant = getScenarioThreeVariant(scenario, opt);
  if (scenarioThreeVariant) return buildScenarioThreePreview(scenarioThreeVariant);

  const scenarioFiveVariant = getScenarioFiveVariant(scenario, opt);
  if (scenarioFiveVariant) return buildScenarioFivePreview(scenarioFiveVariant);

  const scenarioSevenVariant = getScenarioSevenVariant(scenario, opt);
  if (scenarioSevenVariant) return buildScenarioSevenPreview(scenarioSevenVariant);

  const c = opt.content;
  switch (opt.type) {
    case 'popup': {
      return `
        <div class="pv-popup">
          <div class="pv-icon">${c.icon ?? '💡'}</div>
          <div class="pv-heading">${c.heading}</div>
          <div class="pv-body">${c.body}</div>
        </div>`;
    }
    case 'sidepanel': {
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
    }
    case 'hud-checklist': {
      const items = c.items.map(t =>
        `<div class="pv-hud-item"><div class="pv-hud-cb"></div><span>${t}</span></div>`
      ).join('');
      return `
        <div class="pv-hud">
          <div class="pv-heading">${c.heading}</div>
          ${items}
        </div>
        <div class="preview-minimap">🗺️</div>`;
    }
    case 'minimap': {
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
    }
    case 'stepbystep': {
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
    }
    case 'ai-buttons': {
      const btns = c.buttons.map(b =>
        `<div class="pv-aib-btn">${b.label}</div>`
      ).join('');
      return `
        <div class="pv-aib">
          <div class="pv-heading">${c.heading}</div>
          <div class="pv-desc">${c.description}</div>
          <div class="pv-aib-grid">${btns}</div>
        </div>`;
    }
    default:
      return `<div style="color:#fff;padding:2rem">알 수 없는 UI 유형: ${opt.type}</div>`;
  }
}


function buildScenarioOnePreview(variant) {
  const normalizedVariant = normalizeScenarioOneVariant(variant);
  const src = SCENARIO_ONE_IMAGES[normalizedVariant];
  const title = SCENARIO_ONE_TITLES[normalizedVariant];

  return `
    <div class="pv-s1-image-wrap">
      <img class="pv-s1-prototype-image"
           src="${src}"
           alt="상황 1 ${title} UI 시안"
           draggable="false">
    </div>`;
}


function buildScenarioTwoPreview(variant) {
  if (variant === 'setup-chat') {
    return `
      <div class="pv-s2-image-wrap">
        <img class="pv-s2-prototype-image"
             src="${SCENARIO_TWO_IMAGES['setup-chat']}"
             alt="상황 2 채팅형 UI 시안"
             draggable="false">
      </div>`;
  }

  if (variant === 'setup-auto') {
    return `
      <div class="pv-s2-image-wrap pv-s2-auto-preview" data-view="compact">
        <img class="pv-s2-prototype-image"
             src="${SCENARIO_TWO_IMAGES['setup-auto']}"
             alt="접근성 자동 설정 완료. 클릭하면 상세 내용을 표시합니다."
             draggable="false">
      </div>`;
  }

  if (variant === 'setup-checklist') {
    return `
      <div class="pv-workshop-checklist pv-s2-checklist">
        <header><b>초기 접근성 설정</b><span>›</span></header>
        <div class="pv-check-list">
          ${[
            ['그래픽 품질 선택 (권장: 중간)', true],
            ['자막 설정 켜기', true],
            ['텍스트 크기 조절 (권장: 크게)', false],
            ['키 배치 접근성 프리셋 선택', false],
            ['설정 저장 후 게임 시작', false]
          ].map(([label, checked]) => `
            <label class="${checked ? 'checked' : ''}">
              <input type="checkbox" ${checked ? 'checked' : ''}>
              <i></i><span>${label}</span>
            </label>
          `).join('')}
        </div>
        <p class="pv-check-status"></p>
      </div>`;
  }

  if (variant === 'setup-manual') {
    return `
      <div class="pv-s2-ui pv-s2-manual">
        <header><b>접근성 설정 변경</b><span>×</span></header>
        <div class="pv-s2-table">
          <div class="head"><b>변경 기능</b><b>변경 전</b><b>변경 후</b></div>
          <div><span>색 보정</span><span>OFF</span><button data-setting="colorCorrection" aria-pressed="true">ON</button></div>
          <div><span>고대비</span><span>OFF</span><button data-setting="highContrast" aria-pressed="true">ON</button></div>
          <div><span>텍스트 크기</span><span>작음</span><select data-setting="textSize"><option>작음</option><option>중간</option><option selected>큼</option></select></div>
          <div><span>지원 언어</span><span>영어</span><select data-setting="language"><option>영어</option><option selected>한국어</option></select></div>
          <div><span>밝기</span><span>40%</span><label><input type="range" min="40" max="100" value="100"><output>100%</output></label></div>
        </div>
        <div class="pv-s2-live-sample">
          <small>변경되는 화면 미리보기</small>
          <b>가독성 미리보기 텍스트</b>
        </div>
        <div class="pv-s2-actions"><button>취소</button><button>이렇게 변경할게요</button></div>
      </div>`;
  }

  return `
    <div class="pv-s2-ui pv-s2-cards">
      <header><b>접근성 설정 마법사</b><span>×</span></header>
      <div class="pv-s2-card-grid">
        <button aria-pressed="false"><b>시각 보조 설정 적용</b><span>◉</span></button>
        <button aria-pressed="false"><b>조작 편의 설정 적용</b><span>☝</span></button>
        <button aria-pressed="false"><b>청각 보조 설정 적용</b><span>◖</span></button>
        <button aria-pressed="false"><b>인지 지원 설정 적용</b><span>▤</span></button>
      </div>
      <p class="pv-s2-card-status">선택된 카드가 없습니다.</p>
      <div class="pv-s2-actions"><button data-action="clear">취소</button><button data-action="apply">이렇게 변경할게요</button></div>
    </div>`;
}

function initializeScenarioTwoPreview(container, variant) {
  if (!container || !variant) return;

  if (variant === 'setup-auto') {
    const wrap = container.querySelector('.pv-s2-auto-preview');
    const image = wrap?.querySelector('img');
    if (!wrap || !image) return;

    wrap.addEventListener('click', () => {
      const showingDetails = wrap.dataset.view === 'details';
      wrap.dataset.view = showingDetails ? 'compact' : 'details';
      image.src = showingDetails
        ? SCENARIO_TWO_IMAGES['setup-auto']
        : SCENARIO_TWO_IMAGES['setup-auto-details'];
    });
    return;
  }

  if (variant === 'setup-manual') {
    const root = container.querySelector('.pv-s2-manual');
    if (!root) return;

    root.querySelectorAll('button[data-setting]').forEach(button => {
      button.addEventListener('click', () => {
        const active = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(active));
        button.textContent = active ? 'ON' : 'OFF';
        updateHostManualPreview(root);
      });
    });

    root.querySelectorAll('select, input[type="range"]').forEach(control => {
      control.addEventListener('input', () => updateHostManualPreview(root));
    });

    updateHostManualPreview(root);
    return;
  }

  if (variant === 'setup-checklist') {
    initializeHostChecklist(container.querySelector('.pv-s2-checklist'));
    return;
  }

  if (variant === 'setup-cards') {
    const root = container.querySelector('.pv-s2-cards');
    if (!root) return;

    const cards = Array.from(root.querySelectorAll('.pv-s2-card-grid button'));
    const update = message => {
      const count = cards.filter(card => card.getAttribute('aria-pressed') === 'true').length;
      root.querySelector('.pv-s2-card-status').textContent =
        message || (count ? `${count}개 카드 선택됨` : '선택된 카드가 없습니다.');
    };

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const active = card.getAttribute('aria-pressed') !== 'true';
        card.setAttribute('aria-pressed', String(active));
        update();
      });
    });

    root.querySelector('[data-action="clear"]').addEventListener('click', () => {
      cards.forEach(card => card.setAttribute('aria-pressed', 'false'));
      update();
    });

    root.querySelector('[data-action="apply"]').addEventListener('click', () => {
      const count = cards.filter(card => card.getAttribute('aria-pressed') === 'true').length;
      update(count ? `${count}개 설정을 적용했어요.` : '먼저 카드를 선택하세요.');
    });
  }
}


function initializeHostChecklist(root) {
  if (!root) return;

  const items = Array.from(root.querySelectorAll('.pv-check-list label'));
  const update = () => {
    const completed = items.filter(item => item.querySelector('input').checked).length;
    items.forEach(item => item.classList.toggle('checked', item.querySelector('input').checked));
    const status = root.querySelector('.pv-check-status');
    if (status) status.textContent = `${completed} / ${items.length} 단계 완료`;
  };

  items.forEach(item => {
    item.querySelector('input').addEventListener('change', update);
  });

  update();
}

function buildScenarioThreePreview(variant) {
  if (variant === 'shop-chat') {
    return `
      <div class="pv-s2-image-wrap">
        <img class="pv-s2-prototype-image"
             src="${SCENARIO_THREE_IMAGES['shop-chat']}"
             alt="상황 3 채팅형 UI 시안"
             draggable="false">
      </div>`;
  }

  if (variant === 'shop-checklist') {
    return `
      <div class="pv-workshop-checklist pv-s3-checklist">
        <header><b>새로 나온 라떼맛 쿠키 건축 패키지 사서 써보고싶어</b><span>›</span></header>
        <div class="pv-check-list">
          ${[
            ['홈 화면에서 좌측 상단 상점 버튼 터치', true],
            ['‘왕국 레벨 달성 패키지’ 터치', true],
            ['오른쪽으로 스크롤', false],
            ['‘라떼맛 쿠키의 사르르 라떼 아틀리에’ 패키지 구매', false],
            ['홈 화면으로 복귀', false],
            ['왼쪽 아래 ‘건설’ 버튼 클릭', false],
            ['구매했던 물품 있는지 확인 후 건설 시작', false]
          ].map(([label, checked]) => `
            <label class="${checked ? 'checked' : ''}">
              <input type="checkbox" ${checked ? 'checked' : ''}>
              <i></i><span>${label}</span>
            </label>
          `).join('')}
        </div>
        <p class="pv-check-status"></p>
      </div>`;
  }

  return `
    <div class="pv-s2-image-wrap pv-s3-highlight-preview" data-view="home">
      <img class="pv-s2-prototype-image"
           src="${SCENARIO_THREE_IMAGES['shop-highlight-home']}"
           alt="홈 화면 상점 버튼 하이라이트. 클릭하면 패키지 위치를 표시합니다."
           draggable="false">
    </div>`;
}

function initializeScenarioThreePreview(container, variant) {
  if (!container || !variant) return;

  if (variant === 'shop-checklist') {
    initializeHostChecklist(container.querySelector('.pv-s3-checklist'));
    return;
  }

  if (variant === 'shop-highlight') {
    const wrap = container.querySelector('.pv-s3-highlight-preview');
    const image = wrap?.querySelector('img');
    if (!wrap || !image) return;

    wrap.addEventListener('click', () => {
      const showingShop = wrap.dataset.view === 'shop';
      wrap.dataset.view = showingShop ? 'home' : 'shop';
      image.src = showingShop
        ? SCENARIO_THREE_IMAGES['shop-highlight-home']
        : SCENARIO_THREE_IMAGES['shop-highlight-shop'];
    });
  }
}



function buildScenarioFivePreview(variant) {
  if (variant === 'combat-popup') {
    return `
      <div class="pv-s2-image-wrap">
        <img class="pv-s2-prototype-image"
             src="${SCENARIO_FIVE_IMAGES['combat-popup']}"
             alt="상황 5 팝업형 전투 정보 UI"
             draggable="false">
      </div>`;
  }

  if (variant === 'combat-sidepanel') {
    const events = [
      ['10:28:41', 'enemy', 'danger', '적1 사망'],
      ['10:28:43', 'dialogue', 'ally', '플레이어 3: 순찰 돌고 올게요'],
      ['10:28:52', 'skill', 'neutral', '플레이어 2가 스킬을 씀'],
      ['10:29:03', 'enemy', 'danger', '적2 사망'],
      ['10:29:13', 'skill', 'neutral', '적 3가 스킬을 씀'],
      ['10:29:14', 'dialogue', 'ally', '플레이어 2: 왼쪽에 스나이퍼'],
      ['10:29:23', 'environment', 'neutral', '좌측상단 15도에서 총소리'],
      ['10:29:32', 'environment', 'neutral', '오른쪽 먼 곳에서 발소리'],
      ['10:29:36', 'timer', 'neutral', '안전 구역 축소까지 01:01'],
      ['10:29:40', 'ai', 'ai', 'AI 설명: 엄폐물 뒤 적 1명']
    ];

    const filters = [
      ['dialogue', '대화'],
      ['timer', '타이머'],
      ['enemy', '적 위치'],
      ['environment', '환경 소리'],
      ['skill', '스킬'],
      ['ai', 'AI 상황 설명']
    ];

    return `
      <div class="pv-s5-live-panel">
        <header><b>실시간 상황 기록</b><span>필터를 눌러 필요한 정보만 표시</span></header>
        <div class="pv-s5-event-list">
          ${events.map(([time, category, tone, text]) => `
            <div data-category="${category}">
              <time>${time}</time><i class="${tone}"></i><span>${text}</span>
            </div>
          `).join('')}
        </div>
        <footer>
          <small>자막 필터</small>
          <div class="pv-s5-filter-buttons">
            ${filters.map(([value, label]) => `
              <button type="button"
                      class="${['dialogue', 'enemy', 'skill'].includes(value) ? 'active' : ''}"
                      data-filter="${value}"
                      aria-pressed="${['dialogue', 'enemy', 'skill'].includes(value)}">
                ${label}
              </button>
            `).join('')}
          </div>
          <p class="pv-s5-filter-status"></p>
        </footer>
      </div>`;
  }

  return `
    <div class="pv-s2-image-wrap pv-s5-filter-preview" data-view="default">
      <img class="pv-s2-prototype-image"
           src="${SCENARIO_FIVE_IMAGES['combat-filter-default']}"
           alt="일반 전투 화면. 클릭하면 저시력용 필터 화면을 표시합니다."
           draggable="false">
    </div>`;
}

function initializeScenarioFivePreview(container, variant) {
  if (!container || !variant) return;

  if (variant === 'combat-sidepanel') {
    const root = container.querySelector('.pv-s5-live-panel');
    if (!root) return;

    const chips = Array.from(root.querySelectorAll('.pv-s5-filter-buttons button'));
    const rows = Array.from(root.querySelectorAll('.pv-s5-event-list > div'));

    const apply = () => {
      const active = chips
        .filter(chip => chip.getAttribute('aria-pressed') === 'true')
        .map(chip => chip.dataset.filter);

      rows.forEach(row => {
        row.hidden = active.length > 0 && !active.includes(row.dataset.category);
      });

      root.querySelector('.pv-s5-filter-status').textContent =
        active.length
          ? `${active.length}개 필터 · ${rows.filter(row => !row.hidden).length}개 표시`
          : `필터 없음 · 전체 ${rows.length}개 표시`;
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const next = chip.getAttribute('aria-pressed') !== 'true';
        chip.setAttribute('aria-pressed', String(next));
        chip.classList.toggle('active', next);
        apply();
      });
    });

    apply();
    return;
  }

  if (variant !== 'combat-filter') return;

  const wrap = container.querySelector('.pv-s5-filter-preview');
  const image = wrap?.querySelector('img');
  if (!wrap || !image) return;

  wrap.addEventListener('click', () => {
    const applied = wrap.dataset.view === 'applied';
    wrap.dataset.view = applied ? 'default' : 'applied';
    image.src = applied
      ? SCENARIO_FIVE_IMAGES['combat-filter-default']
      : SCENARIO_FIVE_IMAGES['combat-filter-applied'];
    image.alt = applied
      ? '일반 전투 화면'
      : '저시력용 고대비 필터가 적용된 전투 화면';
  });
}



function buildScenarioSevenPreview(variant) {
  if (variant === 'strategy-links') {
    return `
      <div class="pv-s7-scroll-wrap">
        <div class="pv-s7-scroll-viewport" tabindex="0"
             aria-label="외부 공략 링크 추천 이미지를 위아래로 스크롤">
          <img src="${SCENARIO_SEVEN_IMAGES['strategy-links']}"
               alt="3-14 스테이지 외부 공략 링크 추천 목록"
               draggable="false">
        </div>
      </div>`;
  }

  const source = variant === 'strategy-popup'
    ? SCENARIO_SEVEN_IMAGES['strategy-popup']
    : SCENARIO_SEVEN_IMAGES['strategy-chat'];

  return `
    <div class="pv-s2-image-wrap">
      <img class="pv-s2-prototype-image"
           src="${source}"
           alt="${variant === 'strategy-popup' ? '추천 팝업형 조합 안내' : '채팅형 공략 안내'}"
           draggable="false">
    </div>`;
}

function initializeScenarioSevenPreview(container, variant) {
  if (!container || variant !== 'strategy-links') return;
  const viewport = container.querySelector('.pv-s7-scroll-viewport');
  if (!viewport) return;
  viewport.scrollTop = 0;
}


function updateHostManualPreview(root) {
  const sample = root.querySelector('.pv-s2-live-sample');
  if (!sample) return;

  const colorOn = root.querySelector('[data-setting="colorCorrection"]').getAttribute('aria-pressed') === 'true';
  const contrastOn = root.querySelector('[data-setting="highContrast"]').getAttribute('aria-pressed') === 'true';
  const textSize = root.querySelector('[data-setting="textSize"]').value;
  const language = root.querySelector('[data-setting="language"]').value;
  const brightness = root.querySelector('input[type="range"]').value;

  root.querySelector('output').textContent = `${brightness}%`;
  sample.classList.toggle('color-on', colorOn);
  sample.classList.toggle('contrast-on', contrastOn);
  sample.style.fontSize = textSize === '큼' ? '15px' : textSize === '중간' ? '12px' : '10px';
  sample.style.filter = `brightness(${brightness}%)`;
  sample.querySelector('small').textContent = `미리보기 · ${language}`;
}



/* ── Host column resizing ───────────────────────────────────────────────── */
const HOST_COLUMN_STORAGE_KEY = 'gaia-host-column-widths-v1';
const HOST_COLUMN_LIMITS = {
  scenarioMin: 135,
  optionMin: 165,
  interviewMin: 360,
  splitterTotal: 16
};

function loadHostColumnWidths() {
  try {
    const saved = JSON.parse(localStorage.getItem(HOST_COLUMN_STORAGE_KEY) || '{}');
    return {
      scenario: Number(saved.scenario) || 190,
      option: Number(saved.option) || 235
    };
  } catch {
    return { scenario: 190, option: 235 };
  }
}

function applyHostColumnWidths(widths) {
  const main = document.getElementById('main');
  if (!main) return;
  main.style.setProperty('--scenario-column-width', `${Math.round(widths.scenario)}px`);
  main.style.setProperty('--option-column-width', `${Math.round(widths.option)}px`);
}

function saveHostColumnWidths(widths) {
  localStorage.setItem(HOST_COLUMN_STORAGE_KEY, JSON.stringify({
    scenario: Math.round(widths.scenario),
    option: Math.round(widths.option)
  }));
}

function getCurrentHostColumnWidths() {
  const scenario = document.getElementById('col-scenarios')?.getBoundingClientRect().width || 190;
  const option = document.getElementById('col-options')?.getBoundingClientRect().width || 235;
  return { scenario, option };
}

function resizeHostColumn(type, deltaX, startingWidths) {
  const main = document.getElementById('main');
  if (!main) return startingWidths;

  const available = main.getBoundingClientRect().width - HOST_COLUMN_LIMITS.splitterTotal;
  let scenario = startingWidths.scenario;
  let option = startingWidths.option;

  if (type === 'scenario') {
    const maxScenario = Math.max(
      HOST_COLUMN_LIMITS.scenarioMin,
      available - option - HOST_COLUMN_LIMITS.interviewMin
    );
    scenario = Math.min(maxScenario, Math.max(
      HOST_COLUMN_LIMITS.scenarioMin,
      startingWidths.scenario + deltaX
    ));
  } else {
    const maxOption = Math.max(
      HOST_COLUMN_LIMITS.optionMin,
      available - scenario - HOST_COLUMN_LIMITS.interviewMin
    );
    option = Math.min(maxOption, Math.max(
      HOST_COLUMN_LIMITS.optionMin,
      startingWidths.option + deltaX
    ));
  }

  const widths = { scenario, option };
  applyHostColumnWidths(widths);
  return widths;
}

function initializeHostColumnResizers() {
  const main = document.getElementById('main');
  if (!main) return;

  let widths = loadHostColumnWidths();
  applyHostColumnWidths(widths);

  const attach = (resizerId, type) => {
    const resizer = document.getElementById(resizerId);
    if (!resizer) return;

    resizer.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;

      const startX = event.clientX;
      const startingWidths = getCurrentHostColumnWidths();
      let nextWidths = startingWidths;

      resizer.setPointerCapture(event.pointerId);
      resizer.classList.add('is-active');
      document.body.classList.add('is-resizing-columns');

      const move = moveEvent => {
        nextWidths = resizeHostColumn(
          type,
          moveEvent.clientX - startX,
          startingWidths
        );
      };

      const stop = stopEvent => {
        if (resizer.hasPointerCapture(stopEvent.pointerId)) {
          resizer.releasePointerCapture(stopEvent.pointerId);
        }
        resizer.classList.remove('is-active');
        document.body.classList.remove('is-resizing-columns');
        widths = nextWidths;
        saveHostColumnWidths(widths);
        resizer.removeEventListener('pointermove', move);
        resizer.removeEventListener('pointerup', stop);
        resizer.removeEventListener('pointercancel', stop);
      };

      resizer.addEventListener('pointermove', move);
      resizer.addEventListener('pointerup', stop);
      resizer.addEventListener('pointercancel', stop);
      event.preventDefault();
    });

    resizer.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const startingWidths = getCurrentHostColumnWidths();
      const nextWidths = resizeHostColumn(type, direction * 16, startingWidths);
      saveHostColumnWidths(nextWidths);
      event.preventDefault();
    });
  };

  attach('scenario-column-resizer', 'scenario');
  attach('option-column-resizer', 'option');
}

initializeHostColumnResizers();


/* ── Event export ────────────────────────────────────────────────────────── */
function exportEventsJSON() { window.location.href = '/export/events-json'; }
