# 📚 نظام الحجوزات والمواعيد - التوثيق الكامل

## 🎯 نظرة عامة

نظام متكامل لإدارة حجوزات الرحلات والمواعيد المتاحة، يسمح للدليل بإنشاء مواعيد وللسائح بالحجز من خلال صفحة واحدة.

---

## 📦 الخدمات API

### `bookingService.js` - 11 دالة

#### **حجوزات المستخدم**
```javascript
// الحصول على حجوزات المستخدم الحالي
getMyBookings() → Array<Booking>

// إنشاء حجز جديد
createBooking(bookingData) → Booking

// الحصول على تفاصيل حجز معين
getBookingById(bookingId) → Booking

// تحديث حالة الحجز (تأكيد/رفض)
updateBooking(bookingId, updateData) → Booking

// إلغاء/حذف الحجز
cancelBooking(bookingId) → void
```

#### **المواعيد (Slots)**
```javascript
// إنشاء موعد جديد للرحلة
createBookingSlot(slotData) → Slot
// Input: { tourId, startDate, startTime, endDate, endTime, availableSpots, price }
// Format: startTime: "MM-DD-HH:mm"

// الحصول على مواعيدي
getMyBookingSlots() → Array<Slot>

// الحصول على المواعيد المتاحة لرحلة معينة
getTourAvailableSlots(tourId) → Array<Slot>

// حجز موعد معين
bookSlot(slotId) → Booking

// تعديل موعد (جديد)
updateBookingSlot(slotId, slotData) → Slot

// حذف موعد (جديد)
deleteBookingSlot(slotId) → void
```

---

## 🎨 المكونات

### 1. **TourSlotsManager** ⭐ [جديد]
**الملف:** `src/components/tours/TourSlotsManager.jsx`

**الغرض:** المدير الرئيسي الذي يوحد كل المواعيد

**الميزات:**
- ✅ واجهات منفصلة حسب دور المستخدم
- ✅ تبويبات ذكية للدليل (عرض/إضافة)
- ✅ عرض مباشر للسائح (الحجز فوراً)
- ✅ تحديث تلقائي للبيانات

**الاستخدام:**
```jsx
<TourSlotsManager tourId={tourId} userRole={userRole} />
```

**Props:**
- `tourId`: معرف الرحلة (string)
- `userRole`: دور المستخدم - "guide" أو "tourist" (string)

**الحالات:**
```
للدليل: [تبويب عرض] [تبويب إضافة]
للسائح: [عرض المتاح فقط للحجز]
```

---

### 2. **CreateBookingSlot**
**الملف:** `src/components/tours/CreateBookingSlot.jsx`

**الغرض:** نموذج لإنشاء موعد جديد

**الميزات:**
- ✅ منتقي التاريخ والوقت
- ✅ حقول الأماكن والسعر
- ✅ تحويل التاريخ تلقائياً للصيغة الصحيحة
- ✅ رسائل نجاح/خطأ
- ✅ تحديث الوالد عند الإنشاء

**الاستخدام:**
```jsx
<CreateBookingSlot 
  tourId={tourId}
  onSlotCreated={handleSlotCreated}
/>
```

**الحقول:**
- `startDate`: تاريخ البداية (date picker)
- `startTime`: وقت البداية (time picker)
- `endDate`: تاريخ النهاية (date picker)
- `endTime`: وقت النهاية (time picker)
- `availableSpots`: عدد الأماكن المتاحة (number)
- `price`: السعر اختياري (number)

---

### 3. **TourBookingSlots**
**الملف:** `src/components/tours/TourBookingSlots.jsx`

**الغرض:** عرض المواعيد المتاحة للحجز

**الميزات:**
- ✅ عرض شبكة من المواعيد
- ✅ اختيار موعد بنقرة
- ✅ عرض تفاصيل الموعد المختار
- ✅ زر "احجز هذا الموعد"
- ✅ معالجة الأخطاء والحالات الفارغة

**الاستخدام:**
```jsx
<TourBookingSlots 
  tourId={tourId}
  onBookingSuccess={handleSuccess}
/>
```

---

### 4. **MyBookingSlots**
**الملف:** `src/components/tours/MyBookingSlots.jsx`

**الغرض:** عرض المواعيد الخاصة بي (للدليل)

**الميزات:**
- ✅ قائمة بجميع المواعيد المنشأة
- ✅ عرض التفاصيل (التاريخ، الأماكن، السعر)
- ✅ زر **حذف** - يحذف الموعد من الـ API
- ✅ زر **تعديل** - جاهز للتطوير المستقبلي
- ✅ تحديث فوري بعد الحذف

**الاستخدام:**
```jsx
<MyBookingSlots />
```

---

### 5. **TouristTrips** (محدث)
**الملف:** `src/Features/Profile/components/TouristTrips.jsx`

**الغرض:** عرض الرحلات المحجوزة في ملف السائح

**الميزات:**
- ✅ عرض جميع الحجوزات
- ✅ ألوان حسب الحالة (مؤكد/قيد الانتظار/مرفوض)
- ✅ معلومات الحجز (الدليل، التاريخ، الأماكن، السعر)
- ✅ تحميل وأخطاء

---

### 6. **GuideBookings** (محدث)
**الملف:** `src/Features/Profile/components/GuideBookings.jsx`

**الغرض:** إدارة الحجوزات الواردة للدليل

**الميزات:**
- ✅ لوحة إحصائيات (الإجمالي، قيد الانتظار، مؤكد، مرفوض)
- ✅ تصفية حسب الحالة
- ✅ أزرار الموافقة/الرفض
- ✅ معلومات السائح (الاسم، البريد، الهاتف)

---

### 7. **TourDetails** (محدث) ⭐
**الملف:** `src/pages/TourDetails.jsx`

**التحديثات:**
```jsx
// import جديد
import TourSlotsManager from "../components/tours/TourSlotsManager";

// في الصفحة (بعد البرنامج والخدمات)
<TourSlotsManager tourId={id} userRole={getUserRole()} />
```

**النتيجة:**
- الدليل يرى: تبويبات لإضافة وعرض المواعيد
- السائح يرى: المواعيد المتاحة للحجز

---

## 🔄 تدفقات العمل

### تدفق **إنشاء موعد** (للدليل):

```
1. الدليل يفتح صفحة الرحلة
   ↓
2. يرى قسم "المواعيد المتاحة"
   ↓
3. يضغط على تبويب "إضافة موعد جديد"
   ↓
4. يظهر نموذج CreateBookingSlot
   ↓
5. يملأ: البداية + النهاية + الأماكن + السعر
   ↓
6. يضغط "إنشاء الموعد"
   ↓
7. API → createBookingSlot()
   ↓
8. ✅ النجاح: "تم إنشاء الموعد"
   ↓
9. التبويب ينتقل تلقائياً إلى "عرض المواعيد"
   ↓
10. الموعد الجديد يظهر في القائمة
```

### تدفق **الحجز** (للسائح):

```
1. السائح يفتح صفحة الرحلة
   ↓
2. يرى قسم "المواعيد المتاحة"
   ↓
3. يرى قائمة الموعد المتاحة (من TourBookingSlots)
   ↓
4. يختار موعد بنقرة (يتم التأكيز عليه)
   ↓
5. يضغط "احجز هذا الموعد"
   ↓
6. API → bookSlot()
   ↓
7. ✅ النجاح: "تم حجز الموعد"
   ↓
8. الموعد يختفي من القائمة (تم حجز جميع الأماكن)
   ↓
9. الحجز يظهر في "رحلاتي"
```

### تدفق **حذف موعد** (للدليل):

```
1. الدليل يفتح تبويب "عرض المواعيد"
   ↓
2. يرى قائمة المواعيد
   ↓
3. يضغط زر "حذف" على الموعد
   ↓
4. تأكيد: "هل أنت متأكد؟"
   ↓
5. يضغط "تأكيد"
   ↓
6. API → deleteBookingSlot()
   ↓
7. ✅ النجاح: "تم حذف الموعد"
   ↓
8. الموعد يختفي من القائمة فوراً
```

---

## 📊 صيغ البيانات

### **Slot Object**
```javascript
{
  id: "uuid",
  tourId: "tour-uuid",
  tourTitle: "رحلة الأقصر",
  startTime: "07-15-03:00",      // MM-DD-HH:mm
  endTime: "07-15-04:00",
  availableSpots: 2,
  price: 150,
  status: "available",            // or "booked"
  bookedCount: 1,
  createdAt: "2024-07-15T10:00:00Z"
}
```

### **Booking Object**
```javascript
{
  id: "uuid",
  slotId: "slot-uuid",
  tourId: "tour-uuid",
  touristId: "tourist-uuid",
  guideId: "guide-uuid",
  bookingDate: "2024-07-15T10:00:00Z",
  numberOfGuests: 2,
  price: 150,
  status: "pending",              // or "confirmed", "rejected"
  touristName: "أحمد محمد",
  touristEmail: "ahmed@example.com",
  touristPhone: "+201001234567",
  guideName: "محمود الدليل"
}
```

### **CreateSlotData Input**
```javascript
{
  tourId: "tour-uuid",
  startTime: "07-15-03:00",       // MM-DD-HH:mm (من formatDateTimeForAPI)
  endTime: "07-15-04:00",
  availableSpots: 2,
  price: 150                       // اختياري
}
```

---

## 🛠️ المساعد الدوال

### في `CreateBookingSlot`:
```javascript
// تحويل التاريخ والوقت إلى صيغة API
formatDateTimeForAPI(date, time) → "MM-DD-HH:mm"

// مثال:
formatDateTimeForAPI("2024-07-15", "03:00") → "07-15-03:00"
```

### في `TourBookingSlots` و `MyBookingSlots`:
```javascript
// تحويل تاريخ API إلى نص عربي
formatDateTime(dateString) → "15/07/2024, 3:00 م"
```

---

## 🎨 الألوان والعناصر UI

```
egypt-teal: #0a7462
egypt-gold: #d4a574
green (متاح): bg-green-100, text-green-800
yellow (قيد الانتظار): bg-yellow-100, text-yellow-800
red (مرفوض): bg-red-100, text-red-800
blue (تعديل): bg-blue-600, hover:bg-blue-700
```

---

## ✅ التحقق من الإنجاز

### **للدليل:**
```
✅ يفتح صفحة رحلة
✅ يرى قسم "المواعيد المتاحة"
✅ يرى تبويبات "عرض" و "إضافة"
✅ يضيف موعد جديد
✅ يحذف موعد
✅ يرى الموعد في القائمة
```

### **للسائح:**
```
✅ يفتح صفحة رحلة
✅ يرى المواعيد المتاحة
✅ يختار موعد
✅ يحجز الموعد
✅ يرى الحجز في "رحلاتي"
```

---

## 🐛 معالجة الأخطاء

- **فشل التحميل:** عرض رسالة خطأ + زر إعادة محاولة
- **فشل الإنشاء:** عرض رسالة الخطأ من API
- **فشل الحجز:** إبقاء الموعد في القائمة
- **فشل الحذف:** عرض رسالة خطأ + عدم حذف الموعد

---

## 📁 البنية النهائية

```
src/
├── components/tours/
│   ├── TourSlotsManager.jsx         ⭐ [جديد - المدير]
│   ├── CreateBookingSlot.jsx        [موجود]
│   ├── TourBookingSlots.jsx         [موجود]
│   └── MyBookingSlots.jsx           [موجود - محدث]
│
├── Services/api/
│   └── bookingService.js            [11 دالة]
│
├── Features/Profile/components/
│   ├── TouristTrips.jsx             [موجود]
│   └── GuideBookings.jsx            [موجود]
│
└── pages/
    └── TourDetails.jsx              ⭐ [محدث - التكامل]
```

---

## 🚀 الخطوات التالية

1. ✅ نظام الحجوزات الأساسي - **مكتمل**
2. ✅ نظام المواعيد - **مكتمل**
3. ✅ التكامل في صفحة TourDetails - **مكتمل**
4. ⏳ تطوير خاصية التعديل (Edit) - **جاهز لاحقاً**
5. ⏳ إضافة الدفع - **جاهز لاحقاً**

---

## 💡 نصائح

- استخدم Browser DevTools لفحص API calls
- تحقق من localStorage عند تسجيل الدخول/الخروج
- استخدم react-hot-toast للرسائل السريعة
- اختبر مع دور guide و tourist مختلف

---

**النظام الآن جاهز للإنتاج! 🎉**
