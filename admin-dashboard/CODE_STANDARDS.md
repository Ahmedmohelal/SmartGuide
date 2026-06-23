# Code Standards & Best Practices

## 📋 معايير الكود

### JavaScript/JSX Standards

#### 1. File Organization

```jsx
// 1. Imports
import React, { useState, useEffect } from "react";
import axios from "axios";

// 2. Constants
const DEFAULT_TIMEOUT = 5000;

// 3. Component
export default function MyComponent() {
  // Logic here
}

// 4. Styles (if inline)
const styles = { /* ... */ };
```

#### 2. Naming Conventions

```javascript
// ✅ Components (PascalCase)
function UserCard() {}
export default UserCard;

// ✅ Functions (camelCase)
function calculateTotal() {}
const handleClick = () => {};

// ✅ Constants (UPPER_SNAKE_CASE)
const MAX_RETRIES = 3;
const API_KEY = "key";

// ✅ Variables (camelCase)
let currentUser = null;
const userId = "123";

// ✅ Private functions (prefix with _)
function _internalHelper() {}
```

#### 3. React Component Structure

```jsx
import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * MyComponent - وصف المكون
 * @param {Object} props - المتغيرات
 * @returns {JSX.Element}
 */
function MyComponent({ 
  title, 
  items = [], 
  onSelect 
}) {
  // 1. State
  const [isLoading, setIsLoading] = useState(false);

  // 2. Effects
  useEffect(() => {
    // Initialize
  }, []);

  // 3. Handlers
  const handleSelect = useCallback((item) => {
    onSelect?.(item);
  }, [onSelect]);

  // 4. Render
  return (
    <div>
      <h2>{title}</h2>
      {items.map(item => (
        <Item 
          key={item.id} 
          item={item}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}

// 5. PropTypes
MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  onSelect: PropTypes.func,
};

export default MyComponent;
```

---

## 🎨 CSS/Tailwind Standards

### Tailwind Classes Order

```jsx
// ✅ الترتيب الصحيح:
// 1. Layout (display, position, flex)
// 2. Sizing (width, height)
// 3. Spacing (padding, margin)
// 4. Colors (text, background, border)
// 5. Typography
// 6. Effects (shadow, opacity)
// 7. Responsive

<div className="
  flex items-center justify-between
  w-full h-auto
  p-4 m-2
  bg-white text-gray-900 border border-gray-200
  text-lg font-bold
  shadow-lg opacity-100
  md:p-6 lg:text-xl
"/>
```

### Common Patterns

```jsx
// ✅ Card Component
<div className="bg-white rounded-lg shadow-md p-6">
  {/* content */}
</div>

// ✅ Button
<button className="
  px-4 py-2 rounded
  bg-blue-500 text-white
  hover:bg-blue-600
  disabled:bg-gray-400
  transition-colors duration-200
"/>

// ✅ Input
<input className="
  w-full px-3 py-2
  border border-gray-300 rounded
  focus:outline-none focus:ring-2 focus:ring-blue-500
  placeholder-gray-400
"/>
```

---

## 🐛 Error Handling

```javascript
// ✅ Try-Catch Pattern
async function fetchData() {
  try {
    const response = await api.get("/data");
    return response.data;
  } catch (error) {
    logger.error("Failed to fetch data", error);
    throw new Error("فشل جلب البيانات");
  }
}

// ✅ Error Boundaries
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error) => logger.error("Component error", error)}
>
  <MyComponent />
</ErrorBoundary>;
```

---

## ✅ Testing Guidelines

```javascript
// ✅ Unit Test Example
import { render, screen } from "@testing-library/react";
import UserCard from "./UserCard";

describe("UserCard", () => {
  it("renders user name", () => {
    render(<UserCard user={{ name: "أحمد" }} />);
    expect(screen.getByText("أحمد")).toBeInTheDocument();
  });

  it("calls onDelete when delete is clicked", () => {
    const onDelete = jest.fn();
    render(<UserCard user={{ id: 1, name: "أحمد" }} onDelete={onDelete} />);
    
    screen.getByRole("button", { name: /حذف/i }).click();
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
```

---

## 🔍 Code Review Checklist

- [ ] الأسماء واضحة ومفهومة
- [ ] لا توجد console logs في الـ production code
- [ ] التعليقات موجودة للأجزاء المعقدة
- [ ] لا توجد نسخ مكررة من الكود
- [ ] المتغيرات محدودة النطاق (scope)
- [ ] الأخطاء معالجة بشكل صحيح
- [ ] الأداء محسّنة (no unnecessary re-renders)
- [ ] الأمان محقق (no XSS, CSRF)
- [ ] اختبارات موجودة (إن أمكن)
- [ ] التوثيق محدّثة

---

## 🚀 Performance Tips

```javascript
// ✅ Memoize Components
const UserCard = React.memo(({ user }) => (
  <div>{user.name}</div>
));

// ✅ useCallback for handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependency]);

// ✅ useMemo for expensive calculations
const sortedUsers = useMemo(
  () => users.sort(),
  [users]
);

// ✅ Code splitting
const HeavyComponent = lazy(() => import("./Heavy"));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>;
```

---

## 📚 Documentation Template

```javascript
/**
 * Function/Component Description
 * 
 * وصف بالعربية
 * 
 * @param {Type} paramName - وصف المتغير
 * @returns {Type} وصف القيمة المرجعة
 * @throws {Error} الأخطاء المحتملة
 * 
 * @example
 * const result = myFunction(arg1, arg2);
 * console.log(result); // expected output
 */
```
