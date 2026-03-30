---
name: CSS 규칙
scope: CSS3
updated: 2026-03-30
---

## 반응형 디자인

- **모바일 우선** 설계
- `max-width` 미디어쿼리 사용

```css
/* ✅ Good - 모바일 우선 */
.button {
  font-size: 16px;
  padding: 10px;
}

@media (max-width: 768px) {
  .button {
    font-size: 14px;
  }
}

/* ❌ Bad - 데스크탑 우선 */
.button {
  font-size: 14px;
}

@media (min-width: 769px) {
  .button {
    font-size: 16px;
  }
}
```

## 폰트 크기

- `clamp()` 함수 사용 (반응형 타이포그래피)

```css
/* ✅ Good - 반응형 폰트 */
body { font-size: clamp(16px, 4vw, 20px); }
h1   { font-size: clamp(24px, 8vw, 48px); }

/* ❌ Bad - 고정 크기 */
body { font-size: 16px; }
h1   { font-size: 32px; }
```

## 터치 영역

- 버튼/터치 요소 최소 **44px × 44px**

```css
/* ✅ Good */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 10px 16px;
}

/* ❌ Bad */
.button {
  width: 30px;
  height: 20px;
}
```

## CSS 변수

- 색상·크기는 반드시 CSS 변수로 관리
- 이 프로젝트 변수 (`css/style.css` 정의) **반드시** 사용
  - `--accent-pipe` (빨강) / `--accent-dev` (초록) / `--accent-pm` (주황) / `--accent-design` (보라)
  - `--bg`, `--surface`, `--text` 등 공통 변수
- 페이지 전용 스타일은 별도 CSS 파일로 분리 (`css/[페이지명].css`)

```css
/* ✅ Good - 변수 정의 & 사용 */
:root {
  --color-primary: #2563eb;
  --color-text: #1f2937;
  --font-size-base: clamp(16px, 4vw, 20px);
  --touch-min: 44px;
  --spacing-unit: 8px;
}

body   { color: var(--color-text); font-size: var(--font-size-base); }
button { background-color: var(--color-primary); min-width: var(--touch-min); }
```
