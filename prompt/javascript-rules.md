---
category: 코드 스타일 가이드
section: JavaScript 규칙
updated: 2025-01-30
---

# 5️⃣ JavaScript 규칙

> 이 파일은 `.claude/CLAUDE.md`에서 참조되는 코드 가이드입니다.

## 따옴표
- **작은따옴표(`'`)** 사용 (쌍따옴표 금지)
- HTML 속성의 따옴표는 제외 (HTML 표준)

```javascript
// ✅ Good
const name = 'John';
const message = 'Hello, world!';
const error = 'User not found';

// ❌ Bad
const name = "John";           // 쌍따옴표
const message = 'Hello, "world!"';  // 따옴표 혼용
```

## 세미콜론
- **필수 사용**
- 모든 문장 끝에 세미콜론 추가

```javascript
// ✅ Good
const name = 'John';
const greet = () => {
  console.log('Hello');
};
const result = 42;

// ❌ Bad
const name = 'John'        // 세미콜론 없음
const greet = () => {
  console.log('Hello')     // 세미콜론 없음
}
```

## 변수 선언
- **const** → **let** → var 순서로 우선
- **var 절대 금지** (블록 스코프 문제)

```javascript
// ✅ Good
const MAX_ITEMS = 10;
let currentIndex = 0;
let userName = 'John';

// ❌ Bad
var MAX_ITEMS = 10;       // var 사용
let MAX_ITEMS = 10;       // 상수인데 let
const currentIndex = 0;   // 변경되는데 const
```

## 화살표 함수
- **화살표 함수** 우선 (단, this 바인딩이 중요한 경우 제외)

```javascript
// ✅ Good
const square = (x) => x * x;
const add = (a, b) => a + b;
const greet = (name) => {
  console.log(`Hello, ${name}`);
};

// ❌ Bad
const square = function(x) { return x * x; };
const add = function(a, b) { return a + b; };
```

## Async/Await
- 비동기 처리는 **async/await** 사용

```javascript
// ✅ Good
const fetchUser = async (id) => {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
};

// ❌ Bad
const fetchUser = (id) => {
  return fetch(`/api/users/${id}`)
    .then(res => res.json())
    .catch(err => console.error(err));
};
```

## 비교 연산자
- **===** 사용 (== 금지)
- **!==** 사용 (!= 금지)

```javascript
// ✅ Good
if (value === 'string') {}
if (count !== 0) {}
if (isValid === true) {}

// ❌ Bad
if (value == 'string') {}
if (count != 0) {}
if (isValid == true) {}
```

## 전역 변수 최소화
- **전역 변수 최소화** (네임스페이스 오염 방지)
- IIFE, 모듈, 클로저 활용하여 스코프 격리
- 변수는 필요한 범위 내에서만 선언

```javascript
// ✅ Good - 클로저로 스코프 격리
const createCounter = () => {
  let count = 0;  // 비공개 변수

  return {
    increment: () => count += 1,
    decrement: () => count -= 1,
    getCount: () => count,
  };
};

const counter = createCounter();
counter.increment();

// ❌ Bad - 전역 변수 사용
let globalCount = 0;
const increment = () => {
  globalCount += 1;
};
const decrement = () => {
  globalCount -= 1;
};
```

## 함수형 패턴
- **순수 함수** 작성 (동일한 입력 → 동일한 출력, 부작용 없음)
- **불변성** 유지 (원본 데이터 변경 금지)
- 필요 시 스프레드 연산자, Object.assign() 활용

```javascript
// ✅ Good - 순수 함수 & 불변성
const addItem = (items, newItem) => {
  return [...items, newItem];
};

const updateUser = (user, newData) => {
  return { ...user, ...newData };
};

const users = [{ id: 1, name: 'John' }];
const newUsers = addItem(users, { id: 2, name: 'Jane' });
// users는 변경 안 됨 ✅

// ❌ Bad - 원본 데이터 변경
const addItem = (items, newItem) => {
  items.push(newItem);
  return items;
};

const updateUser = (user, newData) => {
  user.name = newData.name;
  return user;
};
```
