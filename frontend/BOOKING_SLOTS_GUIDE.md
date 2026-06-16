# نظام الـ Booking Slots ⏰

## ما هو Booking Slots؟
نظام لإدارة المواعيد المتاحة لكل رحلة. الدليل ينشئ مواعيد محددة (slots)، والسائح يختار من بينها للحجز.

---

## 🏗️ المكونات الجديدة:

### 1. **TourBookingSlots.jsx** - عرض المواعيد المتاحة للسائح
```jsx
import TourBookingSlots from "./components/tours/TourBookingSlots";

// استخدام:
<TourBookingSlots 
  tourId="123" 
  onBookingSuccess={() => console.log("تم الحجز!")} 
/>
```

**المميزات:**
- عرض كل الـ slots المتاحة للرحلة
- عرض التاريخ والوقت والأماكن المتاحة
- اختيار موعد والضغط على "احجز"
- معالجة الأخطاء والـ loading states

---

### 2. **CreateBookingSlot.jsx** - إنشاء موعد جديد (للدليل)
```jsx
import CreateBookingSlot from "./components/tours/CreateBookingSlot";

// استخدام:
<CreateBookingSlot 
  tourId="123" 
  onSlotCreated={() => console.log("تم الإنشاء!")} 
/>
```

**المميزات:**
- نموذج لإنشاء موعد جديد
- تاريخ + وقت البداية والنهاية
- عدد الأماكن المتاحة
- سعر اختياري
- التحقق من البيانات والأخطاء

---

### 3. **MyBookingSlots.jsx** - عرض الـ slots التي أنشأتها (للدليل)
```jsx
import MyBookingSlots from "./components/tours/MyBookingSlots";

// استخدام:
<MyBookingSlots />
```

**المميزات:**
- عرض كل الـ slots التي أنشأها الدليل
- معلومات كاملة لكل slot
- عرض عدد الحجوزات
- أزرار تعديل وحذف (جاهزة للتوسع)

---

## 📡 الدوال المضافة في `bookingService.js`:

```javascript
// إنشاء موعد جديد
createBookingSlot(slotData)

// جلب الـ slots الخاصة بي
getMyBookingSlots()

// جلب الـ slots المتاحة للرحلة
getTourAvailableSlots(tourId)

// حجز موعد محدد
bookSlot(slotId)
```

---

## 🔗 API Endpoints المستخدمة:

```
POST   /api/Users/slots                  (إنشاء موعد)
GET    /api/Users/{userId}/slots        (جلب مواعيدي)
GET    /api/Tours/{tourId}/available-slots  (جلب المواعيد المتاحة)
POST   /api/Users/bookings/slot/{slotId}   (حجز موعد)
```

---

## 📝 صيغة البيانات:

### عند إنشاء Slot:
```javascript
{
  tourId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  startTime: "07-15-03:00",        // MM-DD-HH:mm
  endTime: "07-15-04:00",          // MM-DD-HH:mm
  availableSpots: 2,               // عدد الأماكن
  price: 150                        // اختياري
}
```

### الـ Slot المُرجع:
```javascript
{
  id: "slot-123",
  tourId: "tour-456",
  tourTitle: "رحلة الأهرام",
  startTime: "2026-07-15T03:00:00",
  endTime: "2026-07-15T04:00:00",
  availableSpots: 2,
  price: 150,
  status: "available",
  bookedCount: 1
}
```

---

## 🚀 مثال عملي كامل:

### في صفحة تفاصيل الرحلة (للسائح):
```jsx
import TourBookingSlots from "../components/tours/TourBookingSlots";

function TourDetailsPage({ tourId }) {
  return (
    <div>
      <h1>تفاصيل الرحلة</h1>
      <TourBookingSlots 
        tourId={tourId}
        onBookingSuccess={() => {
          alert("تم الحجز بنجاح!");
          // reload data
        }}
      />
    </div>
  );
}
```

### في لوحة تحكم الدليل (للدليل):
```jsx
import CreateBookingSlot from "../components/tours/CreateBookingSlot";
import MyBookingSlots from "../components/tours/MyBookingSlots";

function GuideDashboard() {
  const tourId = "my-tour-123";
  
  return (
    <div className="space-y-8">
      <div>
        <h2>إضافة مواعيد جديدة</h2>
        <CreateBookingSlot tourId={tourId} />
      </div>
      
      <div>
        <h2>المواعيد الموجودة</h2>
        <MyBookingSlots />
      </div>
    </div>
  );
}
```

---

## ⚙️ التخصيص:

### تغيير صيغة التاريخ:
تعديل دالة `formatDateTime` في المكونات.

### إضافة حقول إضافية:
في `CreateBookingSlot.jsx`، أضف حقول جديدة في `formData` و form.

### تغيير الألوان:
استبدل `egypt-teal` بلون آخر في الـ classes.

---

## ✅ الاختبار:

1. **للسائح:**
   - تصفح رحلة
   - اضغط على "احجز هذا الموعد"
   - تحقق من ظهور الموعد في "رحلاتي"

2. **للدليل:**
   - اضغط "إضافة موعد جديد"
   - ملء البيانات
   - تحقق من ظهوره في "المواعيد الموجودة"
   - حاول حجزه كسائح

---

## 🔔 ملاحظات مهمة:

- جميع الـ slots تُجلب من الـ API مباشرة
- لا يوجد تخزين محلي (localStorage)
- المكونات تتعامل مع الأخطاء بشكل تلقائي
- الأوقات بصيغة `MM-DD-HH:mm` حسب الـ API
- جميع التواريخ بالتوقيت العالمي (UTC)

---

## 🎯 Next Steps:

- تعديل الأزرار في `MyBookingSlots` (حالياً قوالب فقط)
- إضافة التنبيهات والـ notifications
- تصفية الـ slots حسب التاريخ/السعر
- إضافة pagination إذا كان هناك الكثير من الـ slots
