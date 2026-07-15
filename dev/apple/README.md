# Vanilla Apple Lab

Apple 인터페이스의 레이아웃과 모션을 프레임워크 없이 구현한 디자인 쇼케이스입니다.

## 구성

- `index.html` — 전체 시맨틱 마크업
- `src/styles.css` — 화면, 컴포넌트, 반응형 스타일
- `src/main.js` — 스크롤, 페이지 스냅, 도크 DnD, 투명도 슬라이더 동작
- `vendor/` — 브라우저에서 직접 불러오는 Lenis와 GSAP
- `public/favicon.svg` — 파비콘
- `scripts/` — 로컬 미리보기와 배포용 빌드

React, Next.js, Vue 같은 UI 프레임워크와 번들러를 사용하지 않습니다. Lenis와 GSAP만 브라우저용 일반 JavaScript 파일로 포함합니다. 투명도 슬라이더는 `div` 기반입니다.

Siri, Navigation, Controls, Feedback 페이지는 콘텐츠가 없는 레이아웃 슬롯입니다. `index.html`의 주석 위치에 원하는 제목, 설명, 이미지, 컴포넌트를 넣으면 됩니다.

`body` 바로 아래의 `#root`가 전체 쇼케이스 프레임입니다. 바깥 여백과 둥근 모서리, 내부 스크롤은 이 요소를 기준으로 구성되어 있습니다.

## 실행

Node.js 22.13 이상에서 실행합니다.

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:4173`입니다.

## 검사

```bash
npm run lint
npm test
```
