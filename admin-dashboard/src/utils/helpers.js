/**
 * Utility Functions
 * دوال مساعدة عامة للتطبيق
 */

/**
 * Format number to currency
 */
export const formatCurrency = (amount, currency = "EGP") => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, locale = "ar-EG") => {
  return new Date(date).toLocaleDateString(locale);
};

/**
 * Format date and time
 */
export const formatDateTime = (date, locale = "ar-EG") => {
  return new Date(date).toLocaleString(locale);
};

/**
 * Truncate text
 */
export const truncateText = (text, length = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
};

/**
 * Get status label and color
 */
export const getStatusInfo = (status) => {
  const statusMap = {
    active: { label: "نشط", color: "green" },
    inactive: { label: "غير نشط", color: "red" },
    pending: { label: "قيد الانتظار", color: "yellow" },
    approved: { label: "موافق عليه", color: "green" },
    rejected: { label: "مرفوض", color: "red" },
    cancelled: { label: "ملغى", color: "gray" },
  };
  return statusMap[status] || { label: status, color: "gray" };
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get nested property from object
 */
export const getNestedProperty = (obj, path) => {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
};

/**
 * Filter object by keys
 */
export const filterObject = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});
};

/**
 * Merge objects recursively
 */
export const mergeObjects = (target, source) => {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeObjects(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

const isObject = (item) => item && typeof item === "object" && !Array.isArray(item);
