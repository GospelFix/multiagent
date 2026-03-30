---
name: 보안 규칙
scope: JavaScript, HTML
updated: 2026-03-30
---

## 절대 금지

- ❌ API 키를 JS 파일에 하드코딩
- ❌ `document.write()` 사용
- ❌ `innerHTML`에 사용자 입력 삽입 (XSS 위험)
- ❌ 이미지 용량/형식 검증 없이 업로드

```javascript
// ❌ XSS 취약점
element.innerHTML = userInput;

// ✅ 안전한 방법
element.textContent = userInput;
```

## 필수 사항

- ✅ API 키는 환경변수 또는 서버 프록시 사용
- ✅ 이미지 업로드 전 검증 (5MB 이하, jpg/png)
- ✅ 비동기 작업 시 로딩 스피너 표시
- ✅ 에러 발생 시 사용자 친화적 알림
- ✅ 폼 제출 시 버튼 비활성화 (중복 제출 방지)

```javascript
// ✅ 파일 검증
const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png'];
  if (!validTypes.includes(file.type)) throw new Error('jpg 또는 png만 가능합니다');
  if (file.size > 5 * 1024 * 1024) throw new Error('파일 크기는 5MB 이하여야 합니다');
};

// ✅ 폼 중복 제출 방지
const handleSubmit = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    await submitForm(e.target);
  } finally {
    btn.disabled = false;
  }
};
```
