---
name: develop
<<<<<<< HEAD
description: Multi-Agent Studio 개발 시 코드 스타일 가이드 및 프로젝트 컨텍스트를 로드합니다. 새 기능 추가, 버그 수정, 페이지 생성 전에 실행하세요.
=======
description: $ARGUMENTS 개발 시 코드 스타일 가이드 및 프로젝트 컨텍스트를 로드합니다. 새 기능 추가, 버그 수정, 페이지 생성 전에 실행하세요.
>>>>>>> 054604b4fc3eb0ae4ae2ecba298157b85d32d557
updated: 2026-03-03
model: sonnet
---

@.claude/CONTEXT.md
@.claude/RULES.md
@.claude/TASK.md

<<<<<<< HEAD
# Multi-Agent Studio — 개발 가이드
=======
# $ARGUMENTS — 개발 가이드
>>>>>>> 054604b4fc3eb0ae4ae2ecba298157b85d32d557

## 파일 구조

> 참조: `@prompt/architecture-prompt.md`

---

## 기술 스택

> 참조: `@config/mvp-stack.yaml`

---

## 들여쓰기 & 포매팅

> 참조: `@prompt/formatting-guide.md`

스페이스 2칸, 최대 줄 길이 100자, 함수/클래스 사이 2줄 개행

---

## 네이밍 컨벤션

> 참조: `@prompt/naming-conventions.md`

변수/함수: camelCase | 상수: UPPER_SNAKE_CASE | 클래스: PascalCase | 파일: kebab-case | 불린: is/has/should 접두사

---

## HTML 규칙

> 📁 참조: `@prompt/html-rules.md`

시맨틱 태그, alt/aria-label 속성, viewport 메타 태그 필수

---

## CSS 규칙

> 참조: `@prompt/css-rules.md`

모바일 우선, clamp() 함수, 터치 영역 44px, CSS 변수 사용

---

## JavaScript 규칙

> 참조: `@prompt/javascript-rules.md`

작은따옴표, 세미콜론 필수, const/let 우선, 화살표 함수, async/await, === 사용

---

## 주석 & 문서화

> 참조: `@prompt/comments-documentation.md`

한국어 주석, 복잡한 로직만, JSDoc 스타일, TODO/FIXME 마크

---

## 코드 구조

> 참조: `@prompt/code-structure.md`

함수 구성: 변수선언 → 헬퍼함수 → 초기화 → 실행 | Import 순서: 외부라이브러리 → 상대경로

---

## 목데이터 규칙

> 참조: `@prompt/mock-data-rules.md`

`data/*.json`으로 분리 관리, API 연동 전 목데이터로 개발

---

## 절대 하지 말 것 & 반드시 할 것

> 참조: `@prompt/code-safety.md`

API 키 하드코딩 금지, XSS 취약점 방지, 파일 검증, 환경변수 사용, 로딩스피너, 에러 처리

---

## 체크리스트

> 참조: `@prompt/code-checklist.md`

HTML, CSS, JavaScript 항목별 검증 리스트

---

## 참조 순서

작업 시 다음 파일들을 순서대로 확인하세요:

1. `@prompt/[해당-가이드].md` - 구체적인 코드 규칙
2. `@config/mvp-stack.yaml` - 기술 스택
3. `@config/design-system.md` - 디자인 시스템