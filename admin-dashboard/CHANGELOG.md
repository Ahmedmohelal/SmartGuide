# Changelog

جميع التغييرات المهمة لهذا المشروع سيتم توثيقها في هذا الملف.

## [Unreleased]

### Added
- نظام تسجيل مركزي (Logger)
- ملفات ثوابت محسّنة (Constants)
- React Hooks مخصصة (useAsync, useForm, useLocalStorage)
- معالج أخطاء مركزي (ErrorHandler)
- دوال مساعدة متقدمة (Helpers)
- نظام التحقق من الصحة (Validation)
- بيانات وهمية للتطوير (Mock Data)

### Changed
- إعادة هيكلة المشروع لتحسين الصيانة
- تنظيم أفضل للـ utilities و constants

### Improved
- توثيق شامل للمشروع
- معايير الكود والأفضليات
- دليل استكشاف الأخطاء

---

## [1.0.0] - 2024-06-24

### Initial Release
- نظام مصادقة آمن
- إدارة الأدلاء والمستخدمين
- إدارة الحجوزات والجولات
- تتبع الإيرادات
- سجل العمليات (Audit Log)
- رسوم بيانية وتحليلات

---

### Version Format
سنتبع [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: جديد متوافق للخلف
- PATCH: إصلاحات الأخطاء

### How to Add Changelog Entry

```markdown
### [X.Y.Z] - YYYY-MM-DD

#### Added
- الميزات الجديدة

#### Changed
- التغييرات على الميزات الموجودة

#### Deprecated
- الميزات المحذوفة تدريجياً

#### Removed
- الميزات المحذوفة

#### Fixed
- إصلاحات الأخطاء

#### Security
- تحسينات الأمان
```
