/**
 * Validation Rules
 * قواعد التحقق من صحة المدخلات
 */

export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "البريد الإلكتروني غير صحيح",
  },

  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: "كلمة المرور يجب أن تحتوي على حروف كبيرة، صغيرة، أرقام، ورموز",
  },

  phone: {
    pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    message: "رقم الهاتف غير صحيح",
  },

  url: {
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    message: "الرابط غير صحيح",
  },

  username: {
    pattern: /^[a-zA-Z0-9_]{3,16}$/,
    message: "اسم المستخدم يجب أن يكون من 3 إلى 16 حرف وأرقام وشرطة سفلية فقط",
  },
};

/**
 * Validate field
 */
export const validateField = (value, rule) => {
  if (!value) return "هذا الحقل مطلوب";
  if (!rule.pattern.test(value)) return rule.message;
  return null;
};

/**
 * Validate form
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const rule = rules[field];
    const error = validateField(value, rule);
    if (error) errors[field] = error;
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
