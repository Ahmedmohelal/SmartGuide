# Admin Dashboard Architecture

## 🏗️ معمارية التطبيق

```
┌─────────────────────────────────────┐
│         React Application           │
│   (UI Layer - Components)           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│       Context Layer                 │
│  (State Management - AdminData)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│       Services Layer                │
│   (Business Logic - authService)    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│       API Layer (Axios)             │
│   (HTTP Requests - Backend)         │
└─────────────────────────────────────┘
```

---

## 📦 Data Flow

### Unidirectional Data Flow (Redux-inspired)

```
User Action (Click)
    ↓
Event Handler (Component)
    ↓
Service/Hook (Business Logic)
    ↓
API Call (axios)
    ↓
Response Handler
    ↓
Context Update (dispatch-like)
    ↓
Component Re-render
    ↓
UI Update
```

### مثال عملي:

```jsx
// 1. User clicks delete button
<button onClick={handleDelete}>حذف</button>

// 2. Event handler
const handleDelete = async (userId) => {
  // 3. Call service
  try {
    await adminService.deleteUser(userId);
    
    // 4. API request sent
    // POST /admin/users/:id/delete
    
    // 5. Handle response
    updateContext({ ...data });
    
    // 6. Show toast
    showSuccessToast("تم الحذف");
    
    // 7. Component updates
  } catch (error) {
    handleError(error);
  }
};
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│  Login Page │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  POST /auth/admin/login             │
│  { email, password }                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Response                           │
│  { token, refreshToken }            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Store tokens in localStorage       │
│  Set Authorization header           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Redirect to Dashboard              │
│  Load protected routes              │
└─────────────────────────────────────┘
```

---

## 🛡️ Protected Routes

```jsx
// ProtectedRoute checks:
1. Is token present? ✓
2. Is token valid? ✓
3. Is user admin? ✓
4. Is token expired?
   - Yes: Attempt refresh
   - No: Continue

// If all checks pass → Show component
// Otherwise → Redirect to login
```

---

## 🔄 Token Refresh Strategy

```
API Request
    ↓
Response 401 (Unauthorized)?
    ├─ No → Return response
    └─ Yes ↓
       Try refresh token
       ├─ Success → Retry original request
       └─ Fail → Redirect to login
```

---

## 📊 State Management Pattern

```javascript
// Context structure
{
  // User data
  currentUser: { id, name, email, role },
  
  // App data
  users: [],
  guides: [],
  bookings: [],
  
  // UI state
  loading: false,
  error: null,
  
  // Pagination
  page: 1,
  pageSize: 10,
  total: 0,
  
  // Filters
  filters: {},
  
  // Actions
  fetchUsers: async () => {},
  deleteUser: async (id) => {},
  updateUser: async (id, data) => {},
}
```

---

## 🎯 Design Patterns Used

### 1. Context API (State Management)
```jsx
const { users, loading } = useContext(AdminDataContext);
```

### 2. Custom Hooks (Reusable Logic)
```jsx
const { data, loading, error, execute } = useAsync(fetchUsers);
```

### 3. Service Layer (API Abstraction)
```jsx
const response = await adminService.getUsers();
```

### 4. Error Boundary (Error Handling)
```jsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### 5. Lazy Loading (Code Splitting)
```jsx
const HeavyPage = lazy(() => import("./HeavyPage"));
```

---

## 🚀 Performance Optimizations

1. **Component Memoization**
   ```jsx
   const UserCard = React.memo(({ user }) => {...});
   ```

2. **useCallback for handlers**
   ```jsx
   const handleDelete = useCallback(() => {...}, [deps]);
   ```

3. **useMemo for calculations**
   ```jsx
   const total = useMemo(() => calculate(data), [data]);
   ```

4. **Code Splitting**
   ```jsx
   const Component = lazy(() => import("./Component"));
   ```

5. **Image Optimization**
   - استخدام صور مضغوطة
   - Lazy loading for images
   - Responsive images

---

## 🔌 API Integration Points

| Endpoint | Method | Service | Purpose |
|----------|--------|---------|---------|
| `/auth/admin/login` | POST | authService | Login |
| `/admin/users` | GET | adminService | Fetch users |
| `/admin/users/:id` | DELETE | adminService | Delete user |
| `/admin/guides/:id/approve` | POST | adminService | Approve guide |
| `/admin/revenue/statistics` | GET | adminService | Get revenue stats |

---

## 🧪 Testing Strategy

### Unit Tests
- اختبار الدوال المساعدة
- اختبار الـ utilities

### Component Tests
- اختبار المكونات الفردية
- اختبار الـ hooks

### Integration Tests
- اختبار تكامل المكونات
- اختبار API flows

### E2E Tests
- اختبار سيناريوهات المستخدم
- اختبار الـ workflows

---

## 🔒 Security Considerations

1. **XSS Protection**
   - React escapes by default
   - Use DOMPurify للمحتوى الديناميكي

2. **CSRF Protection**
   - تأكد من CSRF tokens في API

3. **Authentication**
   - JWT tokens
   - Refresh token rotation

4. **Authorization**
   - Check permissions قبل API calls
   - Verify on server side

5. **Data Validation**
   - Validate inputs
   - Sanitize data
