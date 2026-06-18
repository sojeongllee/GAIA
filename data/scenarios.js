/**
 * Workshop scenarios and AI UI options.
 * Edit this file to change workshop content without touching any other code.
 *
 * UI option types:
 *   'popup'        — 팝업 설명형
 *   'sidepanel'    — 사이드 패널형
 *   'hud-checklist'— HUD 체크리스트형
 *   'minimap'      — 미니맵/화살표 안내형
 *   'stepbystep'   — 단계별 도움형
 *   'ai-buttons'   — AI 추천 버튼형
 */

module.exports = [
  // ─────────────────────────────────────────
  // 시나리오 1: 튜토리얼 이해
  // ─────────────────────────────────────────
  {
    id: 'scenario-1',
    title: '처음 하는 게임에서 튜토리얼을 이해해야 하는 상황',
    shortTitle: '튜토리얼 이해',
    options: [
      {
        id: 's1-popup',
        title: '팝업 설명형',
        type: 'popup',
        content: {
          icon: '📖',
          heading: '튜토리얼 도움말',
          body: '지금은 기본 이동을 연습하는 단계예요.\n\nW, A, S, D 키로 캐릭터를 움직여 보세요.\n파란색 화살표 방향으로 이동하면 다음 단계로 넘어갑니다.'
        }
      },
      {
        id: 's1-stepbystep',
        title: '단계별 도움형',
        type: 'stepbystep',
        content: {
          heading: '튜토리얼 따라하기',
          steps: [
            'W·A·S·D 키로 캐릭터 이동하기',
            '마우스로 시야 방향 돌리기',
            '파란 구역으로 이동하기',
            'NPC에게 말 걸기'
          ]
        }
      },
      {
        id: 's1-hud',
        title: 'HUD 체크리스트형',
        type: 'hud-checklist',
        content: {
          heading: '튜토리얼 목표',
          items: ['캐릭터 이동 완료', '시야 전환 완료', '파란 구역 도착', 'NPC 대화 시작']
        }
      },
      {
        id: 's1-sidepanel',
        title: '사이드 패널형',
        type: 'sidepanel',
        content: {
          heading: '튜토리얼 가이드',
          sections: [
            { title: '지금 해야 할 것', body: '기본 이동 키를 익혀봐요.\nW(앞) · S(뒤) · A(왼쪽) · D(오른쪽)' },
            { title: '다음 목표', body: '파란 화살표를 따라 이동하면 다음 단계가 시작돼요.' },
            { title: '막히면?', body: 'AI 도움 버튼을 누르면 더 자세한 설명을 볼 수 있어요.' }
          ]
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // 시나리오 2: 접근성 설정
  // ─────────────────────────────────────────
  {
    id: 'scenario-2',
    title: '게임 시작 전 접근성 설정을 조정해야 하는 상황',
    shortTitle: '접근성 설정',
    options: [
      {
        id: 's2-popup',
        title: '팝업 설명형',
        type: 'popup',
        content: {
          icon: '⚙️',
          heading: '접근성 설정 안내',
          body: '플레이에 도움이 되는 설정을 추천해 드릴게요.\n\n• 자막: 켜기\n• 색상 필터: 색맹 보정 모드\n• 텍스트 크기: 크게\n• 버튼 연타 줄이기: 켜기'
        }
      },
      {
        id: 's2-ai-buttons',
        title: 'AI 추천 버튼형',
        type: 'ai-buttons',
        content: {
          heading: 'AI가 추천하는 설정',
          description: '어떤 방식으로 플레이하고 싶으신가요?',
          buttons: [
            { label: '🎮 기본 설정으로 시작', action: 'default' },
            { label: '👁️ 시각 보조 설정', action: 'visual' },
            { label: '🖐️ 조작 편의 설정', action: 'motor' },
            { label: '📖 인지 보조 설정', action: 'cognitive' }
          ]
        }
      },
      {
        id: 's2-sidepanel',
        title: '사이드 패널형',
        type: 'sidepanel',
        content: {
          heading: '접근성 설정 가이드',
          sections: [
            { title: '시각 설정', body: '텍스트 크기, 색상 필터, 자막 크기를 조절할 수 있어요.' },
            { title: '조작 설정', body: '연타 줄이기, 버튼 반응 속도, 자동 조준을 설정해요.' },
            { title: '소리 설정', body: '효과음 크기, 음성 자막, 시각적 신호를 설정해요.' }
          ]
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // 시나리오 3: 퀘스트 길 찾기
  // ─────────────────────────────────────────
  {
    id: 'scenario-3',
    title: '퀘스트 중 어디로 가야 하는지 모르는 상황',
    shortTitle: '퀘스트 길 찾기',
    options: [
      {
        id: 's3-minimap',
        title: '미니맵/화살표 안내형',
        type: 'minimap',
        content: {
          heading: '목적지 안내',
          description: '미니맵의 화살표를 따라가세요',
          direction: 'northeast',
          distance: '약 200m 앞'
        }
      },
      {
        id: 's3-popup',
        title: '팝업 설명형',
        type: 'popup',
        content: {
          icon: '🗺️',
          heading: '퀘스트 위치 안내',
          body: '목적지는 북동쪽 마을 입구에 있어요.\n\n미니맵의 주황색 마커를 따라가면\n약 2분 안에 도착할 수 있어요.'
        }
      },
      {
        id: 's3-hud',
        title: 'HUD 체크리스트형',
        type: 'hud-checklist',
        content: {
          heading: '퀘스트 목표',
          items: [
            '북동쪽 마을 입구로 이동',
            '마을 입구 NPC 만나기',
            '아이템 전달하기',
            '보상 받기'
          ]
        }
      },
      {
        id: 's3-sidepanel',
        title: '사이드 패널형',
        type: 'sidepanel',
        content: {
          heading: '퀘스트 안내',
          sections: [
            { title: '현재 목표', body: '북동쪽 마을 입구로 이동해야 해요.' },
            { title: '길 찾기', body: '미니맵의 주황 마커를 따라가세요.\n화면 오른쪽 위 방향으로 이동하면 돼요.' },
            { title: '도착하면', body: 'NPC에게 말을 걸면 다음 단계가 시작돼요.' }
          ]
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // 시나리오 4: 전투 조작 지원
  // ─────────────────────────────────────────
  {
    id: 'scenario-4',
    title: '전투 중 빠른 조작이 어려운 상황',
    shortTitle: '전투 조작 지원',
    options: [
      {
        id: 's4-ai-buttons',
        title: 'AI 추천 버튼형',
        type: 'ai-buttons',
        content: {
          heading: '전투 도우미',
          description: '어떤 행동을 할까요?',
          buttons: [
            { label: '⚔️ 공격하기', action: 'attack' },
            { label: '🛡️ 방어하기', action: 'defend' },
            { label: '💊 회복하기', action: 'heal' },
            { label: '🏃 피하기', action: 'dodge' }
          ]
        }
      },
      {
        id: 's4-stepbystep',
        title: '단계별 도움형',
        type: 'stepbystep',
        content: {
          heading: '전투 순서 안내',
          steps: [
            '적의 공격 패턴 확인하기',
            '안전한 위치로 이동하기',
            '공격 타이밍에 맞춰 공격하기',
            'HP가 낮으면 회복하기'
          ]
        }
      },
      {
        id: 's4-hud',
        title: 'HUD 체크리스트형',
        type: 'hud-checklist',
        content: {
          heading: '전투 체크리스트',
          items: [
            'HP 확인 (50% 이하면 회복)',
            '스킬 쿨타임 확인',
            '적 방향 확인',
            '아이템 준비 상태 확인'
          ]
        }
      },
      {
        id: 's4-popup',
        title: '팝업 설명형',
        type: 'popup',
        content: {
          icon: '⚔️',
          heading: '전투 상황 분석',
          body: '지금 상황을 정리해 드릴게요.\n\n• 적 HP: 60% 남음\n• 내 HP: 낮음 → 회복 권장\n• 추천 행동: 먼저 회복 후 공격'
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // 시나리오 5: 복귀 플레이어
  // ─────────────────────────────────────────
  {
    id: 'scenario-5',
    title: '오랜만에 게임에 돌아와 이전 목표를 잊은 상황',
    shortTitle: '복귀 플레이어 지원',
    options: [
      {
        id: 's5-popup',
        title: '팝업 설명형',
        type: 'popup',
        content: {
          icon: '🎮',
          heading: '다시 오신 것을 환영해요!',
          body: '마지막 접속: 14일 전\n\n지난번에 하던 일:\n• 어둠의 숲 퀘스트 진행 중\n• 마법사 NPC를 만나야 해요\n• 레벨 12 달성 직전이에요'
        }
      },
      {
        id: 's5-sidepanel',
        title: '사이드 패널형',
        type: 'sidepanel',
        content: {
          heading: '복귀 요약',
          sections: [
            { title: '마지막 진행 상황', body: '어둠의 숲 퀘스트\n진행도: 3/5 완료' },
            { title: '다음 목표', body: '마법사 멀린에게 마법 주문서 전달하기' },
            { title: '내 캐릭터 상태', body: 'Lv.11 전사\nHP: 최대\n인벤토리: 정상' }
          ]
        }
      },
      {
        id: 's5-hud',
        title: 'HUD 체크리스트형',
        type: 'hud-checklist',
        content: {
          heading: '복귀 체크리스트',
          items: [
            '현재 퀘스트 확인: 어둠의 숲',
            '인벤토리 정리하기',
            '마법사 NPC 위치 확인',
            '레벨업 준비 완료'
          ]
        }
      },
      {
        id: 's5-ai-buttons',
        title: 'AI 추천 버튼형',
        type: 'ai-buttons',
        content: {
          heading: '복귀 플레이어 지원',
          description: '어디서부터 시작할까요?',
          buttons: [
            { label: '📋 진행 상황 요약 보기', action: 'summary' },
            { label: '🗺️ 목적지로 바로 이동', action: 'navigate' },
            { label: '🎒 인벤토리 정리 도움', action: 'inventory' },
            { label: '🔄 튜토리얼 다시 보기', action: 'tutorial' }
          ]
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // 시나리오 6: 팀 소통 지원
  // ─────────────────────────────────────────
  {
    id: 'scenario-6',
    title: '팀 플레이에서 음성채팅을 듣거나 말하기 어려운 상황',
    shortTitle: '팀 소통 지원',
    options: [
      {
        id: 's6-sidepanel',
        title: '사이드 패널형',
        type: 'sidepanel',
        content: {
          heading: '팀 소통 패널',
          sections: [
            { title: '팀원 메시지 (자막)', body: '[팀원1] 북쪽 공격!\n[팀원2] 저는 회복 담당\n[팀원3] 입구 막겠습니다' },
            { title: '팀 상태', body: '팀원 1: HP 정상 🟢\n팀원 2: HP 낮음 🔴\n팀원 3: HP 정상 🟢' }
          ]
        }
      },
      {
        id: 's6-hud',
        title: 'HUD 체크리스트형',
        type: 'hud-checklist',
        content: {
          heading: '팀 작전',
          items: [
            '팀원1: 북쪽 공격 담당',
            '팀원2: 회복 담당',
            '팀원3: 입구 수비',
            '나: 대기 후 지원'
          ]
        }
      },
      {
        id: 's6-ai-buttons',
        title: 'AI 추천 버튼형',
        type: 'ai-buttons',
        content: {
          heading: '빠른 팀 소통',
          description: '팀에게 전달할 내용을 선택하세요',
          buttons: [
            { label: '✅ 준비 완료', action: 'ready' },
            { label: '🆘 도움 필요', action: 'help' },
            { label: '⚔️ 공격 시작', action: 'attack' },
            { label: '🔙 후퇴', action: 'retreat' }
          ]
        }
      },
      {
        id: 's6-popup',
        title: '팝업 설명형',
        type: 'popup',
        content: {
          icon: '👥',
          heading: '팀 작전 요약',
          body: 'AI가 팀 음성채팅을 자막으로 변환했어요.\n\n현재 작전:\n• 팀원들이 북쪽 공격을 준비 중\n• 당신은 회복 아이템을 들고 대기\n• 신호에 맞춰 지원 역할'
        }
      }
    ]
  }
];
