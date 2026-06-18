# GAIA Workshop — Wizard-of-Oz Prototype

A local web app for running the GAIA game accessibility workshop.
The host controls what participants see; participants rate the AI UI options in real time.

---

## Setup

```
npm install
npm start
```

Then open:

| URL | Who uses it |
|-----|------------|
| http://localhost:3000 | Landing page with links |
| http://localhost:3000/host | Facilitator control panel |
| http://localhost:3000/participant?pid=P1 | Participant P1 screen |
| http://localhost:3000/participant?pid=P2 | Participant P2 screen |

Open the host and participant URLs in **separate browser tabs** (or devices on the same network).

---

## Workshop flow

1. Open `/host` on the facilitator's machine.
2. Open `/participant?pid=P1` on the participant's screen (same network).
3. In the host panel, click a **scenario** on the left, then an **option card** in the middle.
4. Click **"참가자에게 보이기"** — the participant screen updates instantly.
5. The participant rates the UI and submits. The response appears in the host log immediately.
6. Use **"↺ 초기화"** to reset the participant screen before the next option.
7. Export all responses as **JSON** or **CSV** at any time.

---

## File structure

```
GAIA/
├── server.js                 — Express + Socket.IO server
├── data/
│   └── scenarios.js          — ⭐ Edit this to change workshop content
├── public/
│   ├── index.html            — Landing page
│   ├── host.html             — Facilitator panel
│   ├── participant.html      — Participant game screen
│   ├── css/
│   │   ├── host.css
│   │   └── participant.css
│   └── js/
│       ├── host.js
│       └── participant.js
└── README.md
```

**To change workshop content** (scenarios, options, text): edit `data/scenarios.js` only.  
Restart the server after editing.

---

## UI option types

| type | 이름 |
|------|------|
| `popup` | 팝업 설명형 |
| `sidepanel` | 사이드 패널형 |
| `hud-checklist` | HUD 체크리스트형 |
| `minimap` | 미니맵/화살표 안내형 |
| `stepbystep` | 단계별 도움형 |
| `ai-buttons` | AI 추천 버튼형 |

---

## Exported data fields

`timestamp`, `participantId`, `scenarioId`, `scenarioTitle`,  
`optionId`, `optionTitle`, `helpfulness`, `interventionLevel`,  
`activationMode`, `detailRequest`, `comment`
