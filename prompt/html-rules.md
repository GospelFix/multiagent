---
category: 코드 스타일 가이드
section: HTML 규칙
updated: 2025-01-30
---

# 3️⃣ HTML 규칙

> 이 파일은 `.claude/CLAUDE.md`에서 참조되는 코드 가이드입니다.

## 시맨틱 태그
- `<header>`, `<main>`, `<section>`, `<footer>` 사용
- 의미에 맞는 태그 선택 (div 남용 금지)

```html
<!-- ✅ Good -->
<header>
  <nav>...</nav>
</header>
<main>
  <section>콘텐츠</section>
</main>
<footer>...</footer>

<!-- ❌ Bad -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">
  <div class="section">콘텐츠</div>
</div>
```

## 접근성
- **alt 속성** 필수 (이미지)
- **aria-label** 사용 (의미 전달)

```html
<!-- ✅ Good -->
<img src="logo.png" alt="회사 로고">
<button aria-label="메뉴 열기">☰</button>

<!-- ❌ Bad -->
<img src="logo.png">
<button>☰</button>
```

## 모바일 설정
- viewport 메타 태그 필수

```html
<!-- ✅ Good -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
