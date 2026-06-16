# ✅ نظام الحجوزات - جاهز للاستخدام

## 📁 الملفات الجديدة/المحدثة:

```
✅ src/Services/api/bookingService.js          [جديد]
✅ src/Features/Profile/components/TouristTrips.jsx    [محدث - الآن يستخدم API]
✅ src/Features/Profile/components/GuideBookings.jsx   [جديد]
✅ src/config/api.js                          [محدث - إضافة BOOKINGS]
```

---

## 🚀 كيف تستخدمه:

### للسائح - عرض الرحلات المحجوزة:
```jsx
import TouristTrips from "./components/TouristTrips";

// في Profile page:
<TouristTrips />  // يعرض الحجوزات مباشرة من API
```

### للدليل - إدارة الحجوزات:
```jsx
import GuideBookings from "../Features/Profile/components/GuideBookings";

// في Guide Dashboard:
<GuideBookings />  // يعرض كل الحجوزات + إحصائيات + موافقة/رفض
```

---

## 📊 المميزات:

### TouristTrips:
- ✅ عرض الرحلات المحجوزة
- ✅ تاريخ - دليل - عدد الضيوف - السعر
- ✅ حالة الحجز (مؤكد/قيد الانتظار/مرفوض)
- ✅ Loading/Error states

### GuideBookings:
- ✅ إحصائيات (الإجمالي، قيد الانتظار، مؤكدة، مرفوضة)
- ✅ فلترة حسب الحالة
- ✅ موافقة/رفض الحجوزات المعلقة
- ✅ عرض بيانات السائح (بريد، هاتف)
- ✅ Loading/Error states

---

## 🔧 API المستخدمة:

```javascript
GET    /api/Users/bookings        // جلب الحجوزات
POST   /api/Users/bookings        // إنشاء حجز
PUT    /api/bookings/{id}         // تحديث الحالة
DELETE /api/bookings/{id}         // إلغاء
```

---

## 📝 شكل البيانات المتوقع:

```javascript
{
  id: "123",
  tourTitle: "رحلة الأهرام",
  touristName: "أحمد",
  touristEmail: "ahmed@example.com",
  touristPhone: "01012345678",
  bookingDate: "2026-06-14",
  numberOfGuests: 2,
  price: 150,
  status: "pending"  // pending, confirmed, rejected
}
```

---

## ✨ تم التطبيق حسب:
- الـ API من الصور المرفقة
- أفضل الممارسات في React
- تصميم احترافي بـ Tailwind
- معالجة الأخطاء الكاملة

**جاهز للاستخدام الفوري!** 🚀
