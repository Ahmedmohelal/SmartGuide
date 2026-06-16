# نظام الحجوزات 🎯

## ✅ تم إنشاء:

### 1. خدمة الحجوزات `bookingService.js`
```javascript
getMyBookings()          // جلب حجوزاتي
createBooking(data)      // إنشاء حجز جديد
updateBooking(id, data)  // تحديث الحجز
cancelBooking(id)        // إلغاء الحجز
```

### 2. مكونات React

#### TouristTrips ✓
- عرض الرحلات المحجوزة
- حالة الحجز (مؤكد/قيد الانتظار/مرفوض)
- معلومات كاملة: التاريخ، الدليل، عدد الضيوف، السعر

#### GuideBookings ✓
- عرض جميع الحجوزات التي استقبلتها
- إحصائيات: الإجمالي، قيد الانتظار، مؤكدة، مرفوضة
- فلترة حسب الحالة
- موافقة/رفض الحجوزات المعلقة
- عرض بيانات السائح: البريد، الهاتف

### 3. API Endpoint
```
GET    /api/Users/bookings          (جلب حجوزاتي)
POST   /api/Users/bookings          (إنشاء حجز)
PUT    /api/bookings/{id}           (تحديث)
DELETE /api/bookings/{id}           (إلغاء)
```

---

## 🚀 الاستخدام

### في Profile التاريج:
```jsx
import TouristTrips from "./components/TouristTrips";

// يعرض الحجوزات تلقائياً
<TouristTrips />
```

### في Dashboard الدليل:
```jsx
import GuideBookings from "../Features/Profile/components/GuideBookings";

// يعرض الحجوزات ويسمح بالموافقة/الرفض
<GuideBookings />
```

---

## 📊 شكل البيانات

```javascript
{
  id: "123",
  tourTitle: "رحلة الأهرام",
  touristName: "أحمد محمود",
  touristEmail: "ahmed@example.com",
  touristPhone: "01012345678",
  bookingDate: "2026-06-14",
  numberOfGuests: 2,
  price: 150,
  status: "pending" // pending, confirmed, rejected
}
```

---

## 🔧 الملفات المعدلة

- `src/config/api.js` - إضافة BOOKINGS endpoint
- `src/Services/api/bookingService.js` - خدمة API
- `src/Features/Profile/components/TouristTrips.jsx` - تحديث
- `src/Features/Profile/components/GuideBookings.jsx` - جديد
