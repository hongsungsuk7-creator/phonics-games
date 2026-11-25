# Phonics Games (FPR K · 파닉스 게임 모음)

5~7세 어휘·생각 트랙 게임 7종 프로토타입과 런처입니다. 빌드 없이 정적 파일로 동작합니다.

| 게임 | 폴더 | 튜터 |
|---|---|---|
| Spin & Peek | `Spin-Peek/` | Nubi |
| Curtain Call | `Curtain-Call/` | Party One |
| Copy Cat | `Copy-Cat/` | Duri |
| Little Detective | `Little-Detective/` | Piko |
| Shop & Count | `Shop-Count/` | Tobi |
| Maze Quest | `Maze-Quest/` | Bobo |
| Photo Safari | `Photo-Safari/` | Nunu |

## 열기
- 로컬: `start.bat` 실행 → http://localhost:5180 (파일을 더블클릭해 열면 `games.json`을 못 읽습니다)
- GitHub Pages: 저장소 Settings → Pages → Branch `main` / `(root)`

## 구조
- `index.html`, `style.css`, `app.js` — 런처 (게임 목록·검색·점검표·TRD 보기)
- `games.json` — 게임 목록과 점검표 데이터
- `trd/` — 게임별 기획 문서(TRD)
- `thumbs/` — 런처 카드 그림
- `_shared/` — 게임 공통 스크립트·스타일 (`.nojekyll` 파일이 있어야 Pages에서 보입니다)

## 게임 추가
1. 새 폴더에 `index.html`을 만들고 `_shared/kit.css`, `_shared/kit.js`를 불러옵니다.
2. `trd/<id>.md`에 TRD를 넣습니다.
3. `games.json`의 `games` 배열에 항목을 추가합니다 (`id`, `title`, `titleKo`, `type`, `playUrl`, `trdUrl`, `thumbnail`, `checklist`).

## URL 옵션 (게임)
`?age=5|6|7`, `?level=1..6`, `?mute=1`, `?speech=off`, `?demo=always`
