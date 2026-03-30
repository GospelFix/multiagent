---
name: 코드 생성 체크리스트
scope: HTML, CSS, JavaScript
updated: 2026-03-30
---

> 코드 생성/수정 후 반드시 검증할 항목

## HTML
- [ ] 시맨틱 태그 사용 (`<header>`, `<main>`, `<section>`, `<footer>`)
- [ ] `alt`, `aria-label` 접근성 속성 추가
- [ ] viewport 메타 태그 설정

## CSS
- [ ] `css/style.css` CSS 변수 사용 (`--accent-pipe`, `--bg`, `--surface` 등)
- [ ] 모바일 우선 `max-width` 미디어쿼리
- [ ] `clamp()` 폰트 크기
- [ ] 최소 44px 터치 영역

## JavaScript
- [ ] `'use strict'` 선언
- [ ] 스페이스 2칸 들여쓰기
- [ ] 작은따옴표·세미콜론 사용
- [ ] `const/let` (var 미사용)
- [ ] `===` / `!==` 비교 연산자
- [ ] camelCase/UPPER_SNAKE_CASE/kebab-case 네이밍 준수
- [ ] 불린: `is` / `has` / `should` 접두사
- [ ] 100자 이내 줄 길이
- [ ] 복잡한 로직에만 한국어 주석

## 보안
- [ ] API 키 하드코딩 없음
- [ ] `innerHTML` 사용자 입력 삽입 없음
- [ ] 폼 중복 제출 방지
