---
category: 코드 스타일 가이드
section: 체크리스트
updated: 2025-01-30
---

# 📋 체크리스트

> 이 파일은 `.claude/CLAUDE.md`에서 참조되는 코드 가이드입니다.
> Claude가 코드 생성 후 반드시 검증할 항목입니다.

## HTML
- [ ] **시맨틱 태그**: `<header>`, `<main>`, `<section>`, `<footer>` 사용?
- [ ] **접근성**: `alt`, `aria-label` 속성 추가?
- [ ] **viewport**: 모바일 viewport 메타 태그 설정?

## CSS
- [ ] **모바일 우선**: `max-width` 미디어쿼리 사용?
- [ ] **폰트 크기**: `clamp()` 함수 사용?
- [ ] **터치 영역**: 최소 44px?
- [ ] **CSS 변수**: 색상/크기 변수로 관리?

```css
:root {
  --color-primary: #2563eb;
  --color-text: #1f2937;
  --font-size-base: clamp(16px, 4vw, 20px);
  --touch-min: 44px;
}
```

## JavaScript
- [ ] **들여쓰기**: 스페이스 2칸?
- [ ] **따옴표**: 작은따옴표 사용?
- [ ] **세미콜론**: 모든 줄 끝에 추가?
- [ ] **네이밍**: camelCase/PascalCase/kebab-case 규칙 준수?
- [ ] **상수**: UPPER_SNAKE_CASE 사용?
- [ ] **불린**: is/has/should 접두사 사용?
- [ ] **===**: 동등 비교 사용?
- [ ] **const/let**: var 미사용?
- [ ] **주석**: 복잡한 로직에만 추가?
- [ ] **최대 줄 길이**: 100자 이내?
