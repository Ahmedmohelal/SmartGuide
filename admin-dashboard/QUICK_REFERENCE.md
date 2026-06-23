# Quick Reference Guide

## 🚀 أوامر سريعة

### البدء السريع
```bash
npm install              # تثبيت الـ dependencies
npm run dev             # بدء خادم التطوير
npm run build           # بناء للإنتاج
npm run preview         # معاينة الإصدار النهائي
```

### التطوير
```bash
# بدء الخادم مع port مخصص
npm run dev -- --port 5176

# بدء الخادم مع HTTPS
npm run dev -- --https

# مراقبة التغييرات
npm run dev
```

---

## 📦 الاستيراد السريع

### الثوابت
```javascript
import { API_ENDPOINTS, STATUS, COLORS } from "@/constants";
```

### الـ Hooks
```javascript
import { useAsync, useForm, useLocalStorage } from "@/hooks";
```

### المساعدين
```javascript
import { 
  formatCurrency, 
  formatDate, 
  validateEmail,
  truncateText 
} from "@/utils";
```

### معالج الأخطاء
```javascript
import { handleApiError, logger } from "@/utils";
```

### الخدمات
```javascript
import { getService } from "@/services";
```

---

## 🎨 مكونات شائعة

### Card Component
```jsx
<div className="bg-white rounded-lg shadow-md p-6">
  {children}
</div>
```

### Button
```jsx
<button className="
  px-4 py-2 bg-blue-500 text-white
  rounded hover:bg-blue-600
  disabled:opacity-50
">
  {label}
</button>
```

### Input
```jsx
<input 
  type="text"
  className="
    w-full px-3 py-2
    border border-gray-300 rounded
    focus:outline-none focus:ring-2 focus:ring-blue-500
  "
  placeholder="أدخل البيانات..."
/>
```

### Loading Spinner
```jsx
{loading ? <div className="text-center">جاري التحميل...</div> : null}
```

---

## 🔐 مثال على Protected Page

```jsx
import { useContext, useState, useEffect } from "react";
import { AdminDataContext } from "@/context/AdminDataContext";
import { useAsync } from "@/hooks";
import { handleApiError, logger } from "@/utils";
import AdminLayout from "@/layout/AdminLayout";

export default function UsersPage() {
  const { users, setUsers } = useContext(AdminDataContext);
  const [filter, setFilter] = useState("");

  const { data, loading, error, execute } = useAsync(
    () => fetch("/api/admin/users").then(r => r.json())
  );

  const handleDelete = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      const errorInfo = handleApiError(error);
      logger.error("Delete failed", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ</div>;

  return (
    <AdminLayout title="المستخدمون">
      <input
        type="text"
        placeholder="بحث..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-4"
      />
      
      {filteredUsers.map(user => (
        <div key={user.id} className="p-4 border rounded mb-2">
          <h3>{user.name}</h3>
          <button onClick={() => handleDelete(user.id)}>حذف</button>
        </div>
      ))}
    </AdminLayout>
  );
}
```

---

## 🐛 استكشاف أخطاء سريع

### CORS Error
```bash
# تأكد من أن الـ Backend مفعّل CORS
# تحقق من VITE_API_BASE_URL صحيحة
# أعد تشغيل dev server
npm run dev
```

### Token Expired
```javascript
// في browser console
localStorage.removeItem('admin_auth_token');
// ثم قم بـ login مرة أخرى
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5175
taskkill /PID <PID> /F

# أو استخدام port آخر
npm run dev -- --port 5176
```

---

## 📚 الملفات الأساسية

| الملف | الغرض |
|-----|-------|
| `src/App.jsx` | التطبيق الرئيسي والـ routing |
| `src/context/AdminDataContext.jsx` | إدارة الحالة العامة |
| `src/services/adminService.js` | API calls للبيانات |
| `src/services/authService.js` | مصادقة المستخدم |
| `src/components/ProtectedRoute.jsx` | حماية المسارات |
| `src/layout/AdminLayout.jsx` | التخطيط الرئيسي |

---

## 🔐 متغيرات البيئة المهمة

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AUTH_TOKEN_KEY=admin_auth_token
VITE_APP_NAME=SmartGuide Admin
```

---

## 🎯 Checklist للميزات الجديدة

- [ ] اقرأ [CODE_STANDARDS.md](./CODE_STANDARDS.md)
- [ ] استخدم الثوابت من `@/constants`
- [ ] استخدم الـ Hooks من `@/hooks`
- [ ] اتبع معايير الأسماء
- [ ] أضف error handling
- [ ] اختبر الميزة
- [ ] وثّق الكود

---

## 🚀 نصيحة ذهبية

**اقرأ الدلائل!** معظم الأسئلة مجابة في:
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - هيكل المشروع
- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - معايير الكود
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - استكشاف الأخطاء

---

**آخر تحديث:** 2024-06-24
