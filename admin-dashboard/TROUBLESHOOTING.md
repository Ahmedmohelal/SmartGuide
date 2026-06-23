# 🛠️ Troubleshooting Guide

## المشاكل الشائعة والحلول

### 1. CORS Error

**المشكلة:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' 
from origin 'http://localhost:5175' has been blocked by CORS policy
```

**الحلول:**
- تأكد من أن الـ Backend يملك CORS enabled
- تحقق من `VITE_API_BASE_URL` صحيحة
- أعد تشغيل الـ dev server

```bash
# أعد تشغيل الـ dev server
npm run dev
```

---

### 2. Token Expired / 401 Unauthorized

**المشكلة:**
```
401 Unauthorized - الرجاء تسجيل الدخول
```

**الحلول:**
- تحقق من أن token في localStorage صحيح
- جرب refresh token
- قم بـ login مرة أخرى

```javascript
// في browser console
localStorage.removeItem('admin_auth_token');
localStorage.removeItem('refresh_token');
// ثم قم بـ login مرة أخرى
```

---

### 3. Port Already in Use

**المشكلة:**
```
Port 5175 is already in use
```

**الحلول:**
```bash
# قتل العملية على الـ port
# Windows
netstat -ano | findstr :5175
taskkill /PID <PID> /F

# أو استخدام port مختلف
npm run dev -- --port 5176
```

---

### 4. Build Fails

**المشكلة:**
```
vite build failed
```

**الحلول:**
```bash
# حذف node_modules والـ dist
rm -rf node_modules dist
npm install
npm run build
```

---

### 5. Dependencies Version Conflict

**المشكلة:**
```
peer dependency error
```

**الحلول:**
```bash
# تحديث المكتبات
npm install --save-dev vite@latest

# أو إعادة تثبيت كل شيء
npm ci
```

---

### 6. Hot Module Replacement (HMR) Issues

**المشكلة:**
التغييرات لا تنعكس على الـ browser

**الحلول:**
- صفّر الـ browser cache
- جرب الـ hard refresh: `Ctrl+Shift+R`
- أعد تشغيل dev server

---

### 7. Context / State Not Updating

**المشكلة:**
State updates لا تنعكس على المكونات

**الحلول:**
```jsx
// ✅ استخدم useContext صحيح
import { useContext } from 'react';
import { AdminDataContext } from './context/AdminDataContext';

export function MyComponent() {
  const { data, setData } = useContext(AdminDataContext);
  // ...
}
```

---

### 8. Image Assets Not Loading

**المشكلة:**
الصور لا تظهر في الـ build

**الحلول:**
```jsx
// ✅ استخدم import للصور
import logo from '../assets/logo.png';

export function Header() {
  return <img src={logo} alt="Logo" />;
}
```

---

## 🔧 Development Tips

### Debug في Browser

```javascript
// في browser console
// عرض localStorage
console.log(localStorage);

// عرض context data
console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);

// ضبط API calls
fetch('http://localhost:5000/api/admin/users')
  .then(r => r.json())
  .then(d => console.log(d));
```

### استخدام React DevTools

- تثبيت [React DevTools](https://react-devtools-tutorial.vercel.app/)
- فحص components و props
- تتبع state changes

### استخدام Network Tab

- افتح DevTools → Network tab
- راقب API requests/responses
- تحقق من status codes

---

## 📞 للمزيد من المساعدة

- فتح issue على GitHub
- تواصل مع الفريق
- راجع التوثيق الرسمية للمكتبات المستخدمة
