/* ── GAIA workshop TTS ──────────────────────────────────────────────────── */
(() => {
  'use strict';

  const SCRIPT_BY_VARIANT = Object.freeze({
    /* Situation 1 */
    'accessibility-chat':
      '이 게임 접근성 어때? 게임 오목은 저시력 플레이어를 위해 색각 보정, 고대비, 텍스트 크기 조정 접근성을 제공해서 Games and Life 님께서 플레이하시기에 적합합니다. 텍스트 크기는 작음, 중간, 큼의 세 단계로 조절할 수 있습니다.',
    'accessibility-checklist':
      '접근성 평가 결과입니다. 내 접근성 프로필은 시각, 청각, 보조기기입니다. 오목은 색 보정과 고대비를 지원하고 텍스트 크기는 세 단계로 조절할 수 있습니다. 외부 보조기기 연동은 부분 지원하며 메뉴 읽기는 지원하지 않습니다. GAIA가 부족한 기능을 보완할 수 있습니다.',
    'accessibility-reviews':
      '이 게임의 접근성 적합도는 64퍼센트이며 대체로 플레이 가능해 보여요. 필요한 기능 여섯 개 중 네 개를 지원합니다. 좋은 점은 설정 커스터마이징, 텍스트 크기 확대, 효과음을 활용한 진행입니다. 아쉬운 점은 일부 메뉴 읽기 미지원과 보조기기 호환 문제입니다.',

    /* Situation 2 */
    'setup-chat':
      '접근성 자동 설정을 완료했어요. 색 보정과 고대비를 켰고 텍스트 크기를 큼으로, 지원 언어를 한국어로 설정했습니다. 화면 밝기는 80퍼센트로 조정했습니다. 또 필요한 부분이 있으면 불러주세요.',
    'setup-manual':
      '접근성 설정 변경 화면입니다. 색 보정, 고대비, 텍스트 크기, 지원 언어, 밝기를 직접 바꿀 수 있습니다. 현재 변경 전 값은 색 보정 끔, 고대비 끔, 텍스트 작음, 지원 언어 영어, 밝기 40퍼센트입니다.',
    'setup-auto':
      '접근성 자동 설정을 완료했습니다. 자세히 알아보기를 선택하면 색 보정, 고대비, 텍스트 크기, 지원 언어와 밝기의 변경 내용을 확인할 수 있습니다.',
    'setup-checklist':
      '초기 접근성 설정 체크리스트입니다. 그래픽 품질을 중간으로 선택하고 자막을 켜고 텍스트 크기를 크게 조절하고 키 배치 접근성 프리셋을 선택한 뒤 설정을 저장하고 게임을 시작하세요.',
    'setup-cards':
      '접근성 설정 마법사입니다. 시각 보조 설정, 조작 편의 설정, 청각 보조 설정, 인지 지원 설정 중 필요한 카드를 하나 이상 선택한 뒤 적용 버튼을 누르세요.',

    /* Situation 3 */
    'shop-chat':
      '상점에 들어가고 싶으시군요. 홈 화면 왼쪽 상단에 상점 버튼이 있습니다. 해당 버튼을 누르면 상점 페이지로 이동합니다. 왕국 레벨 달성 패키지는 상점 페이지 왼쪽 목록에서 선택할 수 있습니다.',
    'shop-checklist':
      '상점 패키지 구매 체크리스트입니다. 홈 화면 왼쪽 상단 상점 버튼을 누르고 왕국 레벨 달성 패키지를 선택하고 오른쪽으로 스크롤하세요. 라떼맛 쿠키의 사르르 라떼 아틀리에 패키지를 구매한 뒤 홈 화면으로 돌아가 건설 버튼을 누르고 구매한 물품을 확인한 다음 건설을 시작하세요.',
    'shop-highlight':
      '홈 화면 왼쪽 상단의 상점 버튼을 노란색 테두리로 강조했습니다. 강조된 화면을 선택하면 상점 안에서 왕국 레벨 달성 패키지의 위치를 이어서 안내합니다.',

    /* Situation 5 */
    'combat-popup':
      '전투 상황 안내입니다. 적 1 사망. 플레이어 3, 순찰 돌고 올게요. 플레이어 2가 스킬을 사용했습니다. 적 2 사망. 적 3이 스킬을 사용했습니다. 플레이어 2, 왼쪽에 스나이퍼. 좌측 상단 15도에서 총소리. 오른쪽 먼 곳에서 발소리.',
    'combat-sidepanel':
      '실시간 상황 기록 사이드패널입니다. 시간순으로 전투 기록을 확인할 수 있습니다. 하단에서 대화, 타이머, 적 위치, 환경 소리, 스킬, AI 상황 설명 필터를 켜거나 꺼서 필요한 정보만 표시할 수 있습니다.',
    'combat-filter':
      '일반 전투 화면입니다. 화면을 선택하면 저시력 플레이어를 위한 고대비 필터를 적용합니다. 필터는 적을 빨간색, 플레이어를 파란색으로 강조하고 주요 사물과 조작 버튼에 흰색 윤곽선을 표시합니다.',

    /* Situation 7 */
    'strategy-chat':
      '이 스테이지를 못 깨겠어요. 쿠키 레벨은 괜찮지만 현재 조합의 안정성이 부족해 보여요. 용감한 쿠키 대신 좀비맛 쿠키를 사용하면 방어력을 높일 수 있습니다. 힐러를 추가하면 더 안정적이지만 지금 조합으로도 진행할 수 있습니다.',
    'strategy-popup':
      '3 대 14 스테이지 추천 조합입니다. 용감한 쿠키를 좀비맛 쿠키로 변경하면 방어력은 124에서 256으로 높아지고 공격력은 462에서 346으로 낮아집니다. 힐러를 추가하면 더 안정적이지만 좀비맛 쿠키만 추가해도 충분합니다.',
    'strategy-links':
      '3 대 14 스테이지 외부 공략 추천입니다. 머스켓의 무과금 공략과 달달구리의 에스프레소 없이 깨는 공략 등 여러 영상을 위아래로 스크롤해 확인할 수 있습니다.'
  });

  const INTERACTION_SCRIPT = Object.freeze({
    'setup-auto:details':
      '접근성 설정 변경 내용입니다. 색 보정은 끔에서 켬으로, 고대비는 끔에서 켬으로, 텍스트 크기는 작음에서 큼으로, 지원 언어는 영어에서 한국어로, 밝기는 40퍼센트에서 100퍼센트로 변경했습니다.',
    'shop-highlight:shop':
      '상점 화면 왼쪽 메뉴의 왕국 레벨 달성 패키지를 노란색 테두리로 강조했습니다.',
    'combat-filter:applied':
      '저시력용 고대비 필터를 적용했습니다. 배경은 흑백으로 낮추고 적은 빨간색, 플레이어는 파란색, 주요 사물과 인터페이스는 흰색 윤곽선으로 강조했습니다.',
    'combat-filter:default':
      '저시력용 필터를 해제하고 일반 전투 화면으로 돌아왔습니다.'
  });

  const VARIANTS = Object.keys(SCRIPT_BY_VARIANT);
  const overlay = document.getElementById('ui-overlay');

  let currentRoot = null;
  let currentVariant = '';
  let currentText = '';
  let autoTimer = null;
  let requestToken = 0;
  let lastDataView = '';

  function supported() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  function controlsVisible(visible) {
    const controls = document.getElementById('tts-controls');
    if (!controls) return;
    controls.hidden = !visible;

    controls.querySelectorAll('button').forEach(button => {
      button.disabled = visible && !supported();
    });

    if (visible && !supported()) {
      status('이 브라우저는 TTS를 지원하지 않습니다.');
    }
  }

  function status(message) {
    const element = document.getElementById('tts-control-status');
    if (element) element.textContent = message;
  }

  function identifyVariant(root) {
    if (!root) return '';
    return VARIANTS.find(name => root.classList.contains(name)) || '';
  }

  function genericText(root) {
    if (!root) return '';
    return root.innerText
      .replace(/\s+/g, ' ')
      .replace(/×|⠿/g, '')
      .trim();
  }

  function scriptForRoot(root) {
    const variant = identifyVariant(root);
    return {
      variant,
      text: SCRIPT_BY_VARIANT[variant] || genericText(root)
    };
  }

  function splitText(text) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    const sentences = normalized.match(/[^.!?。！？]+[.!?。！？]?/g) || [normalized];
    const chunks = [];

    sentences.forEach(sentence => {
      const value = sentence.trim();
      if (!value) return;

      if (value.length <= 150) {
        chunks.push(value);
      } else {
        for (let index = 0; index < value.length; index += 140) {
          chunks.push(value.slice(index, index + 140));
        }
      }
    });

    return chunks;
  }

  function koreanVoice() {
    if (!supported()) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(voice => /^ko(-|_)/i.test(voice.lang))
      || voices.find(voice => voice.lang?.toLowerCase().startsWith('ko'))
      || null;
  }

  function speak(text) {
    const chunks = splitText(text);
    currentText = String(text || '').trim();

    if (!chunks.length) {
      status('읽을 음성 안내가 없습니다.');
      return;
    }

    if (!supported()) {
      status('이 브라우저는 TTS를 지원하지 않습니다.');
      return;
    }

    window.clearTimeout(autoTimer);
    window.speechSynthesis.cancel();
    requestToken += 1;

    const token = requestToken;
    const voice = koreanVoice();
    let index = 0;

    status('음성 안내 읽는 중');

    const next = () => {
      if (token !== requestToken) return;
      if (index >= chunks.length) {
        status('음성 안내 완료');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.94;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        index += 1;
        next();
      };

      utterance.onerror = event => {
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        status('음성 안내를 재생하지 못했습니다.');
      };

      window.speechSynthesis.speak(utterance);
    };

    next();
  }

  function stop(logRequested = false) {
    window.clearTimeout(autoTimer);
    requestToken += 1;
    if (supported()) window.speechSynthesis.cancel();
    status(logRequested ? '사용자가 음성 안내를 멈췄습니다.' : '음성 안내 멈춤');
  }

  function schedule(root, delay = 450) {
    const resolved = scriptForRoot(root);
    currentRoot = root;
    currentVariant = resolved.variant;
    currentText = resolved.text;
    lastDataView = root?.querySelector('[data-view]')?.dataset.view || '';

    controlsVisible(true);
    status('음성 안내 준비 중');
    window.clearTimeout(autoTimer);

    autoTimer = window.setTimeout(() => {
      if (currentRoot === root && !root.classList.contains('s1-image-hidden')) {
        speak(currentText);
      }
    }, delay);
  }

  function refreshCurrentRoot() {
    const nextRoot = overlay?.firstElementChild || null;

    if (!nextRoot) {
      currentRoot = null;
      currentVariant = '';
      currentText = '';
      stop();
      controlsVisible(false);
      return;
    }

    if (nextRoot !== currentRoot) {
      schedule(nextRoot);
      return;
    }

    if (nextRoot.classList.contains('s1-image-hidden')) {
      stop();
      return;
    }
  }

  function announce(message) {
    if (message) speak(message);
  }

  function controlLabel(control) {
    const row = control.closest('.s2-setting-row');
    return row?.querySelector('span')?.textContent?.trim()
      || control.getAttribute('aria-label')
      || '설정';
  }

  function selectedControlValue(control) {
    if (control.type === 'range') return `${control.value}퍼센트`;
    if (control.tagName === 'SELECT') {
      return control.options[control.selectedIndex]?.textContent || control.value;
    }
    return control.value;
  }

  document.addEventListener('click', event => {
    const target = event.target;

    const toggle = target.closest('.s2-toggle');
    if (toggle) {
      window.setTimeout(() => {
        const active = toggle.getAttribute('aria-pressed') === 'true';
        announce(`${controlLabel(toggle)}을 ${active ? '켰습니다' : '껐습니다'}.`);
      }, 0);
      return;
    }

    const card = target.closest('.s2-setting-card');
    if (card) {
      window.setTimeout(() => {
        const selected = card.getAttribute('aria-pressed') === 'true';
        announce(`${card.dataset.value}, ${selected ? '선택' : '선택 해제'}했습니다.`);
      }, 0);
      return;
    }

    const action = target.closest('[data-action]');
    if (action?.dataset.action === 'reset') {
      announce('변경을 취소하고 기존 접근성 설정으로 되돌렸습니다.');
      return;
    }
    if (action?.dataset.action === 'clear') {
      announce('선택한 접근성 설정 카드를 모두 해제했습니다.');
      return;
    }
    if (action?.dataset.action === 'apply') {
      const selectedCards = currentRoot?.querySelectorAll('.s2-setting-card[aria-pressed="true"]').length || 0;
      announce(
        selectedCards
          ? `${selectedCards}개의 접근성 설정 카드를 적용했습니다.`
          : '선택한 접근성 설정을 적용했습니다.'
      );
      return;
    }

    const filter = target.closest('.s5-filter-chip');
    if (filter) {
      window.setTimeout(() => {
        const active = filter.getAttribute('aria-pressed') === 'true';
        const text = filter.textContent.trim();
        const filterStatus = currentRoot?.querySelector('.s5-filter-status')?.textContent || '';
        announce(`${text} 필터를 ${active ? '켰습니다' : '껐습니다'}. ${filterStatus}`);
      }, 0);
    }
  });

  document.addEventListener('change', event => {
    const control = event.target;

    if (control.matches('select[data-setting], input[type="range"][data-setting]')) {
      announce(`${controlLabel(control)}을 ${selectedControlValue(control)}로 변경했습니다.`);
      return;
    }

    if (control.matches('.s2-check-item input')) {
      const text = control.closest('.s2-check-item')
        ?.querySelector('.s2-check-text')?.textContent?.trim() || '체크리스트 항목';
      announce(`${text}, ${control.checked ? '완료' : '미완료'}로 변경했습니다.`);
      return;
    }

    if (control.matches('.s3-check-item input')) {
      const text = control.closest('.s3-check-item')
        ?.querySelector('.s3-check-text')?.textContent?.trim() || '체크리스트 항목';
      announce(`${text}, ${control.checked ? '완료' : '미완료'}로 변경했습니다.`);
    }
  });

  const observer = new MutationObserver(mutations => {
    refreshCurrentRoot();

    if (!currentRoot || currentRoot.classList.contains('s1-image-hidden')) return;

    for (const mutation of mutations) {
      if (mutation.type !== 'attributes' || mutation.attributeName !== 'data-view') continue;

      const element = mutation.target;
      const nextView = element.dataset.view || '';
      if (nextView === lastDataView) continue;
      lastDataView = nextView;

      if (element.classList.contains('s2-auto-frame')) {
        announce(
          nextView === 'details'
            ? INTERACTION_SCRIPT['setup-auto:details']
            : SCRIPT_BY_VARIANT['setup-auto']
        );
      } else if (element.classList.contains('s3-highlight-frame')) {
        announce(
          nextView === 'shop'
            ? INTERACTION_SCRIPT['shop-highlight:shop']
            : SCRIPT_BY_VARIANT['shop-highlight']
        );
      } else if (element.classList.contains('s5-filter-frame')) {
        announce(
          nextView === 'applied'
            ? INTERACTION_SCRIPT['combat-filter:applied']
            : INTERACTION_SCRIPT['combat-filter:default']
        );
      }
    }

    if (
      currentRoot
      && !currentRoot.classList.contains('s1-image-hidden')
      && status
    ) {
      const resolved = scriptForRoot(currentRoot);
      currentVariant = resolved.variant;
      currentText = resolved.text;
    }
  });

  if (overlay) {
    observer.observe(overlay, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-view']
    });
  }

  window.replayCurrentTts = () => {
    if (currentRoot && currentRoot.classList.contains('s1-image-hidden')) {
      status('먼저 Ctrl+G로 UI를 다시 열어주세요.');
      return;
    }
    speak(currentText || scriptForRoot(currentRoot).text);
  };

  window.stopTts = stop;

  controlsVisible(false);
  refreshCurrentRoot();
})();
