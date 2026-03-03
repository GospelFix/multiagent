---
category: 코드 스타일 가이드
section: 코드 구조
updated: 2025-01-30
---

# 7️⃣ 코드 구조

> 이 파일은 `.claude/CLAUDE.md`에서 참조되는 코드 가이드입니다.

## 함수 구성
- **정의 함수** → **실행 함수** 순서
- 변수 선언 → 헬퍼 함수 → 초기화 함수 → 실행

```javascript
// ✅ Good
const createApp = (initialState = {}) => {
  // 1️⃣ 상태 및 변수 선언
  const state = { ...initialState };

  // 2️⃣ 헬퍼 함수들
  const updateState = (newData) => {
    Object.assign(state, newData);
  };

  const render = () => {
    // 렌더링 로직
  };

  // 3️⃣ 초기화 함수
  const init = () => {
    document.addEventListener('click', handleClick);
  };

  // 4️⃣ 반환
  return { init, updateState };
};

// 5️⃣ 실행
const app = createApp({ isLoading: false });
app.init();

// ❌ Bad
const createApp = () => {
  const init = () => {};
  const updateState = () => {};
  return { init };
};

const state = {};
const app = createApp();
app.init();
```

## Import 정렬
- 순서: **외부 라이브러리** → **상대 경로** → **부분 import**
- 알파벳순 정렬

```javascript
// ✅ Good
// 외부 라이브러리
import fetch from 'node-fetch';

// 상대 경로
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

// 부분 import
import { isDev } from '../utils/index.js';

// ❌ Bad
import { logger } from '../utils/logger.js';
import fetch from 'node-fetch';
import { config } from '../config.js';
```

## 객체/배열 선언
- 간단한 경우: 한 줄에 작성
- 복잡한 경우: 여러 줄로 정렬

```javascript
// ✅ Good (간단함)
const user = { name: 'John', age: 30 };
const tags = ['javascript', 'nodejs', 'react'];

// ✅ Good (복잡함)
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token',
  },
};

// ❌ Bad
const config = { apiUrl: 'https://api.example.com', timeout: 5000, retries: 3, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' } };
```
