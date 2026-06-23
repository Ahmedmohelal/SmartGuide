# Contributing Guidelines

## 🤝 شكراً لاهتمامك بالمساهمة!

هذا المستند يشرح كيفية المساهمة بفاعلية في المشروع.

---

## 📋 قبل البدء

### 1. اقرأ التوثيق الموجودة
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - فهم الهيكل
- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - معايير الكود
- [ARCHITECTURE.md](./ARCHITECTURE.md) - معمارية التطبيق

### 2. تثبيت الأدوات المطلوبة
```bash
git config --global user.name "اسمك"
git config --global user.email "بريدك@example.com"
```

---

## 🔀 خطوات المساهمة

### 1. إنشاء Fork
انقر على "Fork" بأعلى الريبو على GitHub

### 2. Clone الـ Fork الخاص بك
```bash
git clone https://github.com/YOUR-USERNAME/SmartGuideEgypt.git
cd SmartGuideEgypt/admin-dashboard
```

### 3. إنشاء Branch جديد
```bash
git checkout -b feature/اسم-الميزة
# أو
git checkout -b fix/اسم-الإصلاح
```

### 4. اعمل على التغييرات
```bash
# تثبيت الـ dependencies
npm install

# بدء التطوير
npm run dev

# قم بالتعديلات المطلوبة
```

### 5. Test التغييرات
```bash
# تشغيل الاختبارات
npm run test

# بناء المشروع
npm run build
```

### 6. Commit والـ Push
```bash
# إضافة التغييرات
git add .

# Commit مع رسالة واضحة
git commit -m "feat: إضافة ميزة جديدة"

# Push للـ Branch الخاص بك
git push origin feature/اسم-الميزة
```

### 7. فتح Pull Request
- اذهب لـ GitHub
- ستجد زر "Compare & pull request"
- أكمل معلومات PR واشرح التغييرات

---

## 📝 Commit Messages

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: ميزة جديدة
- `fix`: إصلاح خطأ
- `docs`: تحديثات التوثيق
- `style`: تنسيق الكود
- `refactor`: إعادة هيكلة
- `perf`: تحسينات الأداء
- `test`: اختبارات
- `chore`: مهام روتينية

### مثال
```
feat(auth): إضافة نظام التحقق من البريد الإلكتروني

- أضيفت نافذة التحقق الجديدة
- تكامل مع خدمة البريد
- إضافة رسائل تحقق

Closes #123
```

---

## 🎨 معايير الكود

### JavaScript/JSX
- استخدم `const` بدلاً من `let` أو `var`
- استخدم arrow functions
- استخدم destructuring
- أضف JSDoc comments

### React Components
```jsx
/**
 * MyComponent - وصف المكون
 * @param {Object} props
 * @returns {JSX.Element}
 */
function MyComponent({ title, children }) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export default MyComponent;
```

### CSS/Tailwind
- استخدم Tailwind utilities
- اتبع ترتيب الـ classes المحدد
- لا تستخدم inline styles

### Naming
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case`

---

## ✅ PR Checklist

قبل إرسال PR، تأكد من:

- [ ] الكود يتبع معايير المشروع
- [ ] جميع اختبارات تمر بنجاح
- [ ] البناء بدون أخطاء
- [ ] توثيق محدثة (إن لزم الحال)
- [ ] CHANGELOG محدث
- [ ] لا توجد console.logs
- [ ] التغييرات موثقة في وصف PR

---

## 🐛 Reporting Bugs

### معلومات المطلوبة
1. وصف واضح للخطأ
2. خطوات إعادة الإنتاج
3. السلوك المتوقع
4. السلوك الفعلي
5. Screenshots (إن أمكن)
6. معلومات البيئة (OS، Browser، Version)

### مثال
```
**الخطأ:**
المستخدمون لا يستطيعون تسجيل الدخول

**خطوات الإعادة:**
1. اذهب لصفحة تسجيل الدخول
2. أدخل بريد صحيح وكلمة مرور
3. اضغط "دخول"

**السلوك المتوقع:**
يتم تسجيل الدخول والانتقال للـ Dashboard

**السلوك الفعلي:**
رسالة خطأ: "فشل تسجيل الدخول"

**البيئة:**
- OS: Windows 10
- Browser: Chrome 125
- Version: 1.0.0
```

---

## 💡 أفكار للمساهمة

أنواع المساهمات المرحب بها:
- ✨ ميزات جديدة
- 🐛 إصلاحات الأخطاء
- 📚 تحسينات التوثيق
- 🎨 تحسينات التصميم
- ⚡ تحسينات الأداء
- 🔒 تحسينات الأمان
- ✅ اختبارات

---

## 🤔 أسئلة متكررة

### س: كيف أبدأ؟
ج: اقرأ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) أولاً

### س: هل يمكني تغيير البنية الأساسية؟
ج: نعم، لكن ناقش ذلك في issue أولاً

### س: كم من الوقت يستغرق مراجعة PR؟
ج: عادة 1-3 أيام

### س: ماذا لو كان لدي سؤال؟
ج: فتح discussion أو سؤال في issue

---

## 🎯 نصائح للمساهمين الجدد

1. ابدأ بـ issues السهلة المميزة بـ "good first issue"
2. اقرأ PRs السابقة لفهم الأسلوب
3. لا تخاف من الأسئلة
4. اختبر التغييرات جيداً
5. اكتب رسائل commit واضحة

---

## 🙏 شكراً!

كل مساهمة، حتى صغيرة، تساعد في تحسين المشروع.
**شكراً على الاهتمام والمساهمة!** ❤️

---

**Happy Contributing! 🚀**
