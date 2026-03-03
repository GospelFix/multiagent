---
category: 코드 스타일 가이드
section: 주석 & 문서화
updated: 2025-01-30
---

# 6️⃣ 주석 & 문서화

> 이 파일은 `.claude/CLAUDE.md`에서 참조되는 코드 가이드입니다.

## 주석 언어
- **한국어** 사용

```javascript
// ✅ Good
// 사용자 정보 조회
const getUser = (id) => {};

// ❌ Bad
// Get user information
const getUser = (id) => {};
```

## 주석 작성 규칙
- 복잡한 로직에만 주석 추가
- 자명한 코드에는 주석 불필요
- 코드 위에 주석 작성 (같은 줄에 쓰지 않기)

```javascript
// ✅ Good
// API 응답을 JSON으로 변환하고 상태 업데이트
const handleResponse = async (response) => {
  const data = await response.json();
  setState(data);
};

// ❌ Bad
const handleResponse = async (response) => {
  const data = await response.json(); // JSON 변환
  setState(data); // 상태 업데이트
};
```

## JSDoc 스타일
- 공개 함수/클래스는 JSDoc 주석 추가
- 매개변수, 반환값, 예외 명시

```javascript
// ✅ Good
/**
 * 사용자 정보를 조회합니다.
 * @param {number} id - 사용자 ID
 * @returns {Promise<Object>} 사용자 정보 객체
 * @throws {Error} 사용자를 찾을 수 없음
 */
const getUser = async (id) => {
  // ...
};

// ❌ Bad
// 사용자 조회
const getUser = async (id) => {
  // ...
};
```

## TODO/FIXME 주석
- 향후 작업 필요한 부분 표시
- 형식: `// TODO: 작업 내용` 또는 `// FIXME: 수정 필요`

```javascript
// ✅ Good
// TODO: 에러 처리 개선 필요
const fetchData = async () => {};

// FIXME: 성능 최적화 필요
const processLargeArray = (arr) => {};

// ❌ Bad
// 나중에 고쳐야함
const fetchData = async () => {};
```
