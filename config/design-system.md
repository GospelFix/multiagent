# 디자인 시스템

> MVP 범용 디자인 가이드

---

## 목차

1. [개요](#개요)
2. [레이아웃](#레이아웃)
3. [디자인 토큰](#디자인-토큰)
4. [컴포넌트 스타일](#컴포넌트-스타일)
5. [반응형 가이드](#반응형-가이드)

---

## 개요

- **테마**: 라이트/다크 모드 지원
- **모바일 우선**: 기본 최대 너비 390px
- **터치 영역**: 최소 44px

---

## 레이아웃

```
Desktop: 1200px (max-width)
Tablet:  768px
Mobile:  390px
```

---

## 디자인 토큰

### 색상

#### 라이트 테마

| 용도        | 변수명                   | 색상코드  |
| ----------- | ------------------------ | --------- |
| 배경        | `--color-bg`             | `#ffffff` |
| 배경 (카드) | `--color-bg-card`        | `#f5f5f5` |
| 배경 (입력) | `--color-bg-input`       | `#fafafa` |
| 텍스트      | `--color-text`           | `#1a1a1a` |
| 보조 텍스트 | `--color-text-secondary` | `#666666` |
| 경계선      | `--color-border`         | `#e0e0e0` |

#### 다크 테마

| 용도        | 변수명                   | 색상코드  |
| ----------- | ------------------------ | --------- |
| 배경        | `--color-bg`             | `#121212` |
| 배경 (카드) | `--color-bg-card`        | `#1e1e1e` |
| 배경 (입력) | `--color-bg-input`       | `#2a2a2a` |
| 텍스트      | `--color-text`           | `#ffffff` |
| 보조 텍스트 | `--color-text-secondary` | `#a0a0a0` |
| 경계선      | `--color-border`         | `#333333` |

#### 시맨틱 색상

| 용도    | 변수명            | 색상코드  |
| ------- | ----------------- | --------- |
| Primary | `--color-primary` | `#3b82f6` |
| Success | `--color-success` | `#22c55e` |
| Warning | `--color-warning` | `#f59e0b` |
| Error   | `--color-error`   | `#ef4444` |
| Info    | `--color-info`    | `#06b6d4` |

### 타이포그래피

#### 폰트 패밀리

```css
--font-sans: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
--font-mono: "Fira Code", monospace;
```

#### 폰트 크기

| 토큰         | 크기   | 용도     |
| ------------ | ------ | -------- |
| `--text-xs`  | 0.75rem | 캡션     |
| `--text-sm`  | 0.875rem | 보조     |
| `--text-md`  | 1rem   | 본문     |
| `--text-lg`  | 1.125rem | 강조     |
| `--text-xl`  | 1.25rem | 소제목   |
| `--text-2xl` | 1.5rem | 중제목   |
| `--text-3xl` | 1.875rem | 대제목   |

#### 폰트 웨이트

| 토큰              | 값  |
| ----------------- | --- |
| `--font-regular`  | 400 |
| `--font-medium`   | 500 |
| `--font-semibold` | 600 |
| `--font-bold`     | 700 |

### 스페이싱

> 4px 베이스 스케일

| 토큰         | 값    |
| ------------ | ----- |
| `--space-1`  | 4px   |
| `--space-2`  | 8px   |
| `--space-3`  | 12px  |
| `--space-4`  | 16px  |
| `--space-6`  | 24px  |
| `--space-8`  | 32px  |
| `--space-12` | 48px  |

### 기타

| 토큰           | 값   |
| -------------- | ---- |
| `--radius-sm`  | 4px  |
| `--radius-md`  | 8px  |
| `--radius-lg`  | 12px |
| `--radius-full`| 9999px |
| `--touch-min`  | 44px |

---

## CSS 변수 정의

```css
:root {
  /* 라이트 테마 */
  --color-bg: #ffffff;
  --color-bg-card: #f5f5f5;
  --color-bg-input: #fafafa;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e0e0e0;

  /* 시맨틱 색상 */
  --color-primary: #3b82f6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #06b6d4;

  /* 타이포그래피 */
  --font-sans: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: "Fira Code", monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* 스페이싱 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* 기타 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  --touch-min: 44px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* 다크 테마 */
[data-theme="dark"] {
  --color-bg: #121212;
  --color-bg-card: #1e1e1e;
  --color-bg-input: #2a2a2a;
  --color-text: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-border: #333333;
}
```

---

## 컴포넌트 스타일

### 버튼

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-md);
  min-height: var(--touch-min);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
}

.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text);
}
```

### 카드

```css
.card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
}
```

### 입력 필드

```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--text-md);
  min-height: var(--touch-min);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
```

### 토스트

```css
.toast {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-card);
  color: var(--color-text);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}
```

---

## 반응형 가이드

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* 태블릿 */
@media (max-width: 1024px) {
  .container {
    max-width: 768px;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .container {
    max-width: 390px;
  }
}
```
