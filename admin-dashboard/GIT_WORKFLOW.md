# Git Workflow Guidelines

## 🔀 Branch Naming Convention

- `feature/description` - ميزات جديدة
- `fix/description` - إصلاحات الأخطاء
- `refactor/description` - تحسينات الكود
- `docs/description` - تحديثات التوثيق
- `chore/description` - مهام روتينية

مثال:
```bash
git checkout -b feature/admin-dashboard-redesign
git checkout -b fix/authentication-bug
```

## 📝 Commit Message Guidelines

```
<type>: <subject>

<body>

<footer>
```

### Types
- `feat`: ميزة جديدة
- `fix`: إصلاح خطأ
- `docs`: تحديثات التوثيق
- `style`: تنسيق الكود
- `refactor`: إعادة هيكلة الكود
- `perf`: تحسينات الأداء
- `test`: إضافة اختبارات

### مثال

```
feat: add user approval workflow

- Add approval button to user management page
- Create approval modal component
- Integrate with API endpoint

Closes #123
```

## 🔄 Pull Request Process

1. إنشاء feature branch
2. عمل commits محددة وواضحة
3. فتح Pull Request مع وصف دقيق
4. استقبال reviews من الفريق
5. إجراء التعديلات المطلوبة
6. دمج إلى main branch

## ✅ Before Commit

```bash
# تحديث من main
git pull origin main

# التأكد من عدم وجود conflicted files
git status

# تشغيل tests (إن وجد)
npm run test

# بناء المشروع
npm run build
```

## 🚀 Deployment Checklist

- [ ] جميع tests تمر بنجاح
- [ ] build بدون أخطاء
- [ ] تحديث ملف CHANGELOG
- [ ] تحديث version في package.json
- [ ] جميع branches merged إلى main
