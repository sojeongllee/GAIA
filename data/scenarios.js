/**
 * Workshop scenarios and AI UI options.
 * Edit ONLY this file to change workshop content.
 *
 * Structure:
 *   categories — display groupings (A–E)
 *   scenarios  — flat list; each has a categoryId linking to a category
 *
 * UI option types:
 *   'popup'         팝업 설명형
 *   'sidepanel'     사이드 패널형
 *   'hud-checklist' HUD 체크리스트형
 *   'minimap'       미니맵/화살표 안내형
 *   'stepbystep'    단계별 도움형
 *   'ai-buttons'    AI 추천 버튼형
 */

module.exports = {

  categories: [
    { id: 'A', title: 'A. 게임 시작 전 상황' },
    { id: 'B', title: 'B. 플레이 중 정보 인식 상황' },
    { id: 'C', title: 'C. 진행·탐색·기억 상황' },
    { id: 'D', title: 'D. 조작 상황' },
    { id: 'E', title: 'E. 커뮤니케이션 상황' }
  ],

  scenarios: [

    // ── A. 게임 시작 전 상황 ───────────────────────────────────────────────

    {
      id: 'scenario-1',
      categoryId: 'A',
      title: '이 게임을 내가 할 수 있는지 모르겠다',
      description: '예: 스팀/콘솔 스토어에서 게임을 보는데, 접근성 옵션이 충분한지 알 수 없음.',
      options: [
        {
          id: 's1-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '🎮',
            heading: '이 게임, 나도 할 수 있어요',
            body: '접근성 지원 요약\n\n✅ 자막 지원\n✅ 색상 필터 (색맹 보정)\n✅ 키 리매핑\n⚠️ 음성 자막: 미지원\n\n비슷한 유형 플레이어 후기:\n"접근성 옵션만으로도 충분히 즐길 수 있었어요."'
          }
        },
        {
          id: 's1-sidepanel',
          title: '사이드 패널형',
          type: 'sidepanel',
          content: {
            heading: '접근성 분석 리포트',
            sections: [
              { title: '접근성 지원 항목', body: '자막, 색상 필터, 키 리매핑 지원\n음성 자막은 미지원' },
              { title: '비슷한 유저 리뷰', body: '"조작이 어렵지만 접근성 옵션으로 즐길 수 있었어요"\n— 유사 유형 플레이어 후기' },
              { title: '필요한 보조기기', body: '마우스 반응속도 조절 장치 추천\n스위치 컨트롤러 호환 확인됨' }
            ]
          }
        },
        {
          id: 's1-ai-buttons',
          title: 'AI 추천 버튼형',
          type: 'ai-buttons',
          content: {
            heading: '나에게 맞는 게임 찾기',
            description: '어떻게 도움을 드릴까요?',
            buttons: [
              { label: '🔍 접근성 지원 상세 보기', action: 'detail' },
              { label: '👥 유사 유저 리뷰 보기', action: 'reviews' },
              { label: '🎮 대체 게임 추천', action: 'alternatives' },
              { label: '🛠️ 필요한 보조기기 확인', action: 'assistive' }
            ]
          }
        }
      ]
    },

    {
      id: 'scenario-2',
      categoryId: 'A',
      title: '게임 설치·실행·초기 설정이 어렵다',
      description: '예: 그래픽, 자막, 난이도, 키 설정, 접근성 옵션이 너무 많거나 설명이 어려움.',
      options: [
        {
          id: 's2-stepbystep',
          title: '단계별 도움형',
          type: 'stepbystep',
          content: {
            heading: '초기 설정 마법사',
            steps: [
              '그래픽 품질 선택 (권장: 중간)',
              '자막 설정 켜기',
              '텍스트 크기 조절 (권장: 크게)',
              '키 배치 접근성 프리셋 선택',
              '설정 저장 후 게임 시작'
            ]
          }
        },
        {
          id: 's2-ai-buttons',
          title: 'AI 추천 버튼형',
          type: 'ai-buttons',
          content: {
            heading: '나에게 맞는 설정 추천',
            description: '어떤 부분이 어려우신가요?',
            buttons: [
              { label: '👁️ 시각 보조 설정 적용', action: 'visual' },
              { label: '🖐️ 조작 편의 설정 적용', action: 'motor' },
              { label: '👂 청각 보조 설정 적용', action: 'auditory' },
              { label: '📖 인지 지원 설정 적용', action: 'cognitive' }
            ]
          }
        },
        {
          id: 's2-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '⚙️',
            heading: 'AI 추천 접근성 설정',
            body: '사용자 프로필 기반으로 설정을 자동 구성했어요.\n\n적용된 설정:\n• 자막: 켜기 (큰 글씨)\n• 버튼 연타 줄이기: 켜기\n• 색상 필터: 고대비 모드\n• 텍스트 읽기 속도: 느리게'
          }
        }
      ]
    },

    {
      id: 'scenario-3',
      categoryId: 'A',
      title: '조작법과 게임 규칙을 이해하기 어렵다',
      description: '예: 튜토리얼이 빠르거나 텍스트가 많고, 어떤 버튼을 눌러야 하는지 모르겠음.',
      options: [
        {
          id: 's3-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '📖',
            heading: '지금 이렇게 하면 돼요',
            body: '현재 상황: 튜토리얼 — 이동 연습\n\n▶ 왼쪽 스틱: 캐릭터 이동\n▶ A 버튼: 점프\n▶ B 버튼: 공격\n\n파란 화살표 방향으로 이동하면 다음으로 넘어가요.'
          }
        },
        {
          id: 's3-stepbystep',
          title: '단계별 도움형',
          type: 'stepbystep',
          content: {
            heading: '지금 할 것',
            steps: [
              '왼쪽 스틱으로 캐릭터 앞으로 이동',
              '파란 빛이 나는 구역으로 들어가기',
              'A 버튼으로 오브젝트 상호작용',
              'NPC 대화창에서 확인 버튼 누르기'
            ]
          }
        },
        {
          id: 's3-hud',
          title: 'HUD 체크리스트형',
          type: 'hud-checklist',
          content: {
            heading: '튜토리얼 체크리스트',
            items: [
              '이동 방법 익히기',
              '점프 연습하기',
              '기본 공격 해보기',
              'NPC와 대화하기'
            ]
          }
        }
      ]
    },

    // ── B. 플레이 중 정보 인식 상황 ────────────────────────────────────────

    {
      id: 'scenario-4',
      categoryId: 'B',
      title: '화면의 글자, 메뉴, 아이템 설명을 읽기 어렵다',
      description: '예: 작은 글씨, 복잡한 UI, 스크린리더 미지원, 외국어 텍스트.',
      options: [
        {
          id: 's4-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '📖',
            heading: '화면 텍스트 읽어드릴게요',
            body: '[현재 화면 인식 결과]\n\n아이템: 회복 물약\n설명: HP를 50 회복합니다\n가격: 골드 100\n\n효과: 전투 중 사용 가능\n쿨타임: 30초'
          }
        },
        {
          id: 's4-sidepanel',
          title: '사이드 패널형',
          type: 'sidepanel',
          content: {
            heading: '화면 텍스트 안내',
            sections: [
              { title: '현재 선택된 아이템', body: '회복 물약\nHP 50 회복 / 골드 100' },
              { title: '메뉴 구조', body: '인벤토리 → 소비 아이템 탭\n현재 보유: 3개' },
              { title: '사용 방법', body: '아이템 선택 후 X 버튼\n또는 빠른 슬롯에 등록 가능' }
            ]
          }
        },
        {
          id: 's4-ai-buttons',
          title: 'AI 추천 버튼형',
          type: 'ai-buttons',
          content: {
            heading: '텍스트 도움',
            description: '어떻게 도와드릴까요?',
            buttons: [
              { label: '🔊 화면 전체 읽기', action: 'read_all' },
              { label: '📌 선택 항목만 읽기', action: 'read_selected' },
              { label: '🌏 한국어로 번역', action: 'translate' },
              { label: '🔍 텍스트 확대', action: 'zoom' }
            ]
          }
        }
      ]
    },

    {
      id: 'scenario-5',
      categoryId: 'B',
      title: '현재 화면에서 무슨 일이 일어나는지 모르겠다',
      description: '예: 적 위치, NPC 위치, 오브젝트, 체력, 미니맵, 위험 요소를 파악하기 어려움.',
      options: [
        {
          id: 's5-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '🔍',
            heading: '지금 화면 상황',
            body: '현재 위치: 어둠의 숲 — 중앙 구역\n\n👁️ 주변 상황:\n• 적 2마리가 북쪽에 있어요\n• 회복 아이템이 동쪽 나무 옆에 있어요\n• 출구는 남쪽 문이에요\n\n⚠️ 주의: 적이 가까이 오고 있어요!'
          }
        },
        {
          id: 's5-minimap',
          title: '미니맵/화살표 안내형',
          type: 'minimap',
          content: {
            heading: '위험 방향 안내',
            description: '적이 이 방향에 있어요',
            direction: 'north',
            distance: '약 30m 앞'
          }
        },
        {
          id: 's5-sidepanel',
          title: '사이드 패널형',
          type: 'sidepanel',
          content: {
            heading: '현재 상황 브리핑',
            sections: [
              { title: '내 위치', body: '어둠의 숲 — 중앙\n출구까지: 남쪽 150m' },
              { title: '주변 적', body: '⚠️ 적 2마리 (북쪽 30m)\n활 공격 주의 필요' },
              { title: '주변 아이템', body: '💊 회복 물약 (동쪽 나무 옆)\n🔑 열쇠 아이템 (서쪽 상자 안)' }
            ]
          }
        },
        {
          id: 's5-hud',
          title: 'HUD 체크리스트형',
          type: 'hud-checklist',
          content: {
            heading: '위험 알림',
            items: [
              '⚠️ 적 접근 중 (북쪽)',
              '💊 회복 아이템 근처 있음',
              '🚪 출구: 남쪽',
              '🔑 미수집 아이템 있음'
            ]
          }
        }
      ]
    },

    {
      id: 'scenario-6',
      categoryId: 'B',
      title: '소리를 듣기 어렵거나 방향을 알기 어렵다',
      description: '예: 총소리, 발소리, 문 열리는 소리, 보스 공격음, 팀원 음성 지시를 놓침.',
      options: [
        {
          id: 's6-hud',
          title: 'HUD 체크리스트형',
          type: 'hud-checklist',
          content: {
            heading: '소리 자막',
            items: [
              '💥 폭발음 — 북동쪽',
              '👣 발소리 — 뒤쪽 5m',
              '🚪 문 열리는 소리 — 왼쪽',
              '⚠️ 보스 공격음 — 전방'
            ]
          }
        },
        {
          id: 's6-sidepanel',
          title: '사이드 패널형',
          type: 'sidepanel',
          content: {
            heading: '소리 정보 패널',
            sections: [
              { title: '효과음 자막', body: '💥 폭발 (북동쪽)\n👣 발소리 (뒤쪽)\n🚪 문 열림 (왼쪽)' },
              { title: '팀원 음성 자막', body: '[팀원1] "북쪽으로 가자!"\n[팀원2] "나 회복 필요해"' },
              { title: '방향 안내', body: '가장 위험한 소리: 북동쪽\n이동 권장 방향: 남쪽' }
            ]
          }
        },
        {
          id: 's6-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '🔊',
            heading: '소리 & 방향 안내',
            body: '현재 감지된 소리:\n\n⬆️ 북쪽: 적의 발소리\n↗️ 북동쪽: 폭발음\n⬅️ 왼쪽: 문 열리는 소리\n\n팀원 메시지:\n"북쪽으로 이동해!"'
          }
        }
      ]
    },

    // ── C. 진행·탐색·기억 상황 ──────────────────────────────────────────────

    {
      id: 'scenario-7',
      categoryId: 'C',
      title: '공략이나 전략이 필요하다',
      description: '예: 보스를 못 깨거나, 빌드·스킬트리·덱 조합을 모르겠음.',
      options: [
        {
          id: 's7-stepbystep',
          title: '단계별 도움형',
          type: 'stepbystep',
          content: {
            heading: '보스 공략 순서',
            steps: [
              '1페이즈: 보스 왼쪽에 위치하기',
              '빨간 경고 신호 → 즉시 이동',
              '공격 후 반드시 회복 아이템 확인',
              '방어막 생성 시 → 멀리서 원거리 공격',
              '2페이즈: 중앙 이동 후 집중 공격'
            ]
          }
        },
        {
          id: 's7-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '⚔️',
            heading: '현재 상황 공략 힌트',
            body: '보스 HP 40% 이하 → 2페이즈 시작\n\n추천 빌드:\n• 스킬: 순간이동 + 방어막\n• 아이템: 회복 포션 5개 준비\n\n핵심 패턴:\n빨간 빛 후 3초 안에 옆으로 이동!'
          }
        },
        {
          id: 's7-ai-buttons',
          title: 'AI 추천 버튼형',
          type: 'ai-buttons',
          content: {
            heading: '전략 지원',
            description: '어떤 도움이 필요하신가요?',
            buttons: [
              { label: '📋 공략 요약 보기', action: 'guide' },
              { label: '🛠️ 빌드 추천', action: 'build' },
              { label: '🎮 난이도 낮추기', action: 'difficulty' },
              { label: '📺 유튜브 공략 연결', action: 'youtube' }
            ]
          }
        }
      ]
    },

    {
      id: 'scenario-8',
      categoryId: 'C',
      title: '스토리, 목표를 잊었다',
      description: '예: 지난 퀘스트, 캐릭터 관계, 현재 목적을 기억하지 못함.',
      options: [
        {
          id: 's8-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '📖',
            heading: '지금까지의 이야기',
            body: '마지막 접속: 2주 전\n\n스토리 요약:\n• 왕국이 어둠의 세력에 침략당함\n• 당신은 용사로 선택되어 여정 시작\n• 현재 목표: 어둠의 마법사 처치\n\n다음 할 일:\n마법사 멀린에게 주문서 전달'
          }
        },
        {
          id: 's8-sidepanel',
          title: '사이드 패널형',
          type: 'sidepanel',
          content: {
            heading: '복귀 요약',
            sections: [
              { title: '현재 퀘스트', body: '어둠의 숲 탐험\n진행도: 3/5 완료' },
              { title: '다음 목표', body: '마법사 멀린에게 주문서 전달\n위치: 북동쪽 탑' },
              { title: 'NPC 관계', body: '멀린: 동맹 🟢\n마을 장로: 우호 🟢\n상인 봄: 중립 ⚪' }
            ]
          }
        },
        {
          id: 's8-hud',
          title: 'HUD 체크리스트형',
          type: 'hud-checklist',
          content: {
            heading: '복귀 체크리스트',
            items: [
              '현재 퀘스트 확인: 어둠의 숲',
              '인벤토리 정리하기',
              '멀린 NPC 위치 확인',
              '주문서 아이템 보유 여부 확인'
            ]
          }
        }
      ]
    },

    {
      id: 'scenario-9',
      categoryId: 'C',
      title: '이미 잘 하지만 더 잘하고 싶다',
      description: '예: 더 어려운 콘텐츠 도전, 다른 플레이어와 경쟁에서 승리, 높은 점수.',
      options: [
        {
          id: 's9-ai-buttons',
          title: 'AI 추천 버튼형',
          type: 'ai-buttons',
          content: {
            heading: '고급 플레이어 지원',
            description: '어떤 방면으로 성장하고 싶으신가요?',
            buttons: [
              { label: '📊 내 플레이 분석', action: 'analyze' },
              { label: '🏆 랭킹 전략 보기', action: 'ranked' },
              { label: '📺 고수 영상 연결', action: 'videos' },
              { label: '🛠️ 최적 빌드 추천', action: 'build' }
            ]
          }
        },
        {
          id: 's9-sidepanel',
          title: '사이드 패널형',
          type: 'sidepanel',
          content: {
            heading: '플레이 분석',
            sections: [
              { title: '현재 플레이 평가', body: '평균 반응속도: 상위 30%\n회피 성공률: 68%\n스킬 활용도: 중간' },
              { title: '개선 포인트', body: '회피 타이밍을 0.3초 더 일찍\n스킬 콤보 순서 최적화 필요' },
              { title: '추천 콘텐츠', body: '고급 던전 3단계 도전 가능\n랭크 게임 입문 시기 적합' }
            ]
          }
        },
        {
          id: 's9-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '🏆',
            heading: '고급 전략 제안',
            body: '현재 레벨에서 추천 전략:\n\n⚡ 스킬 콤보: A → B → 궁극기\n🛡️ 최적 방어 타이밍: 공격 직전 0.5초\n💡 미사용 스킬 발견: 순간이동\n   (적극 활용 권장)\n\n다음 목표: 고급 던전 3단계 도전'
          }
        }
      ]
    },

    // ── D. 조작 상황 ────────────────────────────────────────────────────────

    {
      id: 'scenario-10',
      categoryId: 'D',
      title: '손이나 몸의 움직임 때문에 조작이 어렵다',
      description: '예: 복잡한 키 조합, 빠른 반응, 드래그, 연타, 마우스 조작이 어려움.',
      options: [
        {
          id: 's10-ai-buttons',
          title: 'AI 추천 버튼형',
          type: 'ai-buttons',
          content: {
            heading: '조작 방식 변경',
            description: '어떤 방식으로 바꿀까요?',
            buttons: [
              { label: '🎙️ 음성 명령으로 전환', action: 'voice' },
              { label: '👁️ 시선 추적으로 전환', action: 'eye' },
              { label: '🔘 스위치 입력으로 전환', action: 'switch' },
              { label: '🤖 자동 조작 보조 켜기', action: 'auto' }
            ]
          }
        },
        {
          id: 's10-popup',
          title: '팝업 설명형',
          type: 'popup',
          content: {
            icon: '🖐️',
            heading: '키 조합 단순화 추천',
            body: '복잡한 조합 → 단순 키로 변환:\n\n기존: Ctrl + Alt + E (구르기)\n변경: Q 키 하나로\n\n기존: 빠른 연타 3회 (특수공격)\n변경: 길게 누르기 1회\n\n설정 적용 후 즉시 사용 가능해요.'
          }
        },
        {
          id: 's10-stepbystep',
          title: '단계별 도움형',
          type: 'stepbystep',
          content: {
            heading: '자동 조작 보조 설정',
            steps: [
              '설정 → 접근성 → 조작 보조 열기',
              '자동 조준 켜기',
              '연타를 길게 누르기로 변환 활성화',
              '이동 속도 조절 켜기',
              '설정 저장 후 테스트'
            ]
          }
        }
      ]
    },

    // ── E. 커뮤니케이션 상황 ─────────────────────────────────────────────────

    {
      id: 'scenario-11',
      categoryId: 'E',
      title: '멀티플레이에서 소통이 어렵다',
      description: '예: 보이스챗을 못 듣거나, 빠르게 채팅하기 어렵거나, 음성으로 말하기 어려움.',
      options: [
        {
          id: 's11-sidepanel',
          title: '사이드 패널형',
          type: 'sidepanel',
          content: {
            heading: '팀 소통 패널',
            sections: [
              { title: '보이스챗 자막', body: '[팀원1] "북쪽 공격해!"\n[팀원2] "나 회복 필요해"\n[팀원3] "입구 막겠습니다"' },
              { title: '채팅 문장 추천', body: '• 준비됐어요!\n• 도움이 필요해요\n• 공격 시작할게요\n• 후퇴합시다' }
            ]
          }
        },
        {
          id: 's11-ai-buttons',
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
          id: 's11-hud',
          title: 'HUD 체크리스트형',
          type: 'hud-checklist',
          content: {
            heading: '팀 상태',
            items: [
              '팀원1: HP 정상 🟢',
              '팀원2: HP 낮음 🔴 (회복 필요)',
              '팀원3: HP 정상 🟢',
              '현재 목표: 북쪽 기지 점령'
            ]
          }
        }
      ]
    }

  ] // end scenarios
};
