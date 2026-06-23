/**
 * Project Structure Documentation
 * 📁 هيكل مشروع Admin Dashboard
 */

/**
 * 📂 ROOT
 * ├── 📄 package.json          - تكوين المشروع والـ dependencies
 * ├── 📄 vite.config.js         - إعدادات Vite
 * ├── 📄 .env.example           - مثال على متغيرات البيئة
 * ├── 📄 .editorconfig          - إعدادات محرر الأكواد
 * ├── 📄 .eslintignore          - ملفات يتم تجاهلها من ESLint
 * ├── 📄 README.md              - دليل المشروع
 * ├── 📄 index.html             - HTML الرئيسي
 * │
 * └── 📁 src/
 *     ├── 📄 main.jsx           - نقطة الدخول
 *     ├── 📄 App.jsx            - مكون التطبيق الرئيسي
 *     ├── 📄 index.css          - أنماط عامة
 *     │
 *     ├── 📁 components/        - مكونات React قابلة لإعادة الاستخدام
 *     │   ├── 📁 Common/        - مكونات عامة (Button, Input, etc)
 *     │   ├── 📁 Charts/        - مكونات الرسوم البيانية
 *     │   ├── 📁 Modals/        - نوافذ منفثقة
 *     │   ├── 📁 Layout/        - مكونات التخطيط
 *     │   ├── DateFilter.jsx    - فلتر التاريخ
 *     │   ├── GuideActionButtons.jsx
 *     │   ├── PageHeader.jsx    - رأس الصفحة
 *     │   ├── ProtectedRoute.jsx - حماية المسارات
 *     │   ├── ReasonModal.jsx   - نافذة السبب
 *     │   ├── StatCard.jsx      - بطاقة الإحصائيات
 *     │   ├── UserActionButtons.jsx
 *     │   └── WalletModal.jsx   - نافذة المحفظة
 *     │
 *     ├── 📁 pages/             - صفحات التطبيق
 *     │   ├── LoginPage.jsx
 *     │   ├── DashboardPage.jsx
 *     │   ├── PendingGuidesPage.jsx
 *     │   ├── GuidesPage.jsx
 *     │   ├── UsersPage.jsx
 *     │   ├── CreateAdminPage.jsx
 *     │   ├── ToursPage.jsx
 *     │   ├── BookingsPage.jsx
 *     │   ├── RevenuePage.jsx
 *     │   └── AuditPage.jsx
 *     │
 *     ├── 📁 services/          - خدمات API والعمليات
 *     │   ├── adminService.js
 *     │   ├── authService.js
 *     │   ├── refreshAuth.js
 *     │   └── setupAxios.js
 *     │
 *     ├── 📁 context/           - React Context (State Management)
 *     │   ├── AdminDataContext.jsx
 *     │   └── ThemeContext.jsx
 *     │
 *     ├── 📁 layout/            - مكونات التخطيط الرئيسية
 *     │   └── AdminLayout.jsx
 *     │
 *     ├── 📁 config/            - ملفات التكوين
 *     │   └── api.js
 *     │
 *     ├── 📁 constants/         - ثوابت التطبيق ✨ NEW
 *     │   ├── api.js            - API endpoints والثوابت
 *     │   ├── roles.js          - الأدوار والصلاحيات
 *     │   └── index.js          - تصدير مركزي
 *     │
 *     ├── 📁 hooks/             - React Hooks مخصصة ✨ NEW
 *     │   └── index.js          - useAsync, useForm, useLocalStorage
 *     │
 *     ├── 📁 utils/             - دوال مساعدة عامة
 *     │   ├── helpers.js        - دوال مساعدة عامة ✨ ENHANCED
 *     │   ├── errorHandler.js   - معالج الأخطاء ✨ NEW
 *     │   ├── tokenUtils.js
 *     │   ├── analytics.js
 *     │   └── index.js          - تصدير مركزي ✨ NEW
 *     │
 *     └── 📁 styles/            - أنماط عامة
 *         └── (Tailwind CSS)
 */

/**
 * 🎯 Best Practices المتبعة
 * 
 * 1. الفصل بين المسؤوليات (Separation of Concerns)
 *    - Components: العرض فقط
 *    - Services: API والمنطق الخارجي
 *    - Utils: دوال مساعدة عامة
 *    - Hooks: منطق قابل لإعادة الاستخدام
 *    - Constants: ثوابت مركزية
 * 
 * 2. Naming Conventions
 *    - Components: PascalCase (MyComponent.jsx)
 *    - Functions: camelCase (myFunction)
 *    - Constants: UPPER_SNAKE_CASE (MY_CONSTANT)
 *    - Folders: lowercase (components, utils)
 * 
 * 3. Import Organization
 *    - React imports أولاً
 *    - External libraries
 *    - Internal components
 *    - Utils و hooks
 *    - Styles أخيراً
 * 
 * 4. Component Structure
 *    - Props validation (PropTypes)
 *    - State management (useState, useContext)
 *    - Effects (useEffect)
 *    - Event handlers
 *    - Render
 * 
 * 5. Error Handling
 *    - Try-catch في API calls
 *    - Centralized error handler
 *    - User-friendly messages
 * 
 * 6. Security
 *    - JWT token in localStorage
 *    - Protected routes
 *    - Token refresh
 *    - CORS headers
 */

/**
 * 🔄 Data Flow
 * 
 * User Input
 *    ↓
 * Event Handler (Component)
 *    ↓
 * Service/Hook (Business Logic)
 *    ↓
 * API Call (axios)
 *    ↓
 * Error Handler (if error)
 *    ↓
 * Context/State Update
 *    ↓
 * Component Re-render
 *    ↓
 * Toast Notification (success/error)
 */

/**
 * 📝 Examples
 * 
 * // ✅ Good Import Organization
 * import React, { useState } from "react";
 * import axios from "axios";
 * import MyComponent from "./components/MyComponent";
 * import { useAsync } from "./hooks";
 * import { formatDate } from "./utils";
 * import { API_ENDPOINTS } from "./constants";
 * import "./styles.css";
 * 
 * // ✅ Good Component Structure
 * export default function UserList() {
 *   const [users, setUsers] = useState([]);
 *   const { data, loading, error } = useAsync(fetchUsers);
 *   
 *   const handleDelete = async (id) => {
 *     // Handle deletion
 *   };
 *   
 *   if (loading) return <div>جاري التحميل...</div>;
 *   if (error) return <div>حدث خطأ</div>;
 *   
 *   return (
 *     <div>
 *       {users.map(user => (
 *         <UserCard key={user.id} user={user} />
 *       ))}
 *     </div>
 *   );
 * }
 */
