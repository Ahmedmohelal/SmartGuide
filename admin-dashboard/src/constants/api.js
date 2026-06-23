/**
 * API Constants
 * تجميع جميع endpoints والثوابت المتعلقة بـ API في ملف واحد
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/admin/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },

  // Users
  USERS: {
    LIST: "/admin/users",
    GET: (id) => `/admin/users/${id}`,
    CREATE: "/admin/users",
    UPDATE: (id) => `/admin/users/${id}`,
    DELETE: (id) => `/admin/users/${id}`,
    TOGGLE_STATUS: (id) => `/admin/users/${id}/toggle-status`,
  },

  // Guides
  GUIDES: {
    LIST: "/admin/guides",
    GET: (id) => `/admin/guides/${id}`,
    PENDING: "/admin/guides/pending",
    APPROVE: (id) => `/admin/guides/${id}/approve`,
    REJECT: (id) => `/admin/guides/${id}/reject`,
    DELETE: (id) => `/admin/guides/${id}`,
  },

  // Tours
  TOURS: {
    LIST: "/admin/tours",
    GET: (id) => `/admin/tours/${id}`,
    CREATE: "/admin/tours",
    UPDATE: (id) => `/admin/tours/${id}`,
    DELETE: (id) => `/admin/tours/${id}`,
  },

  // Bookings
  BOOKINGS: {
    LIST: "/admin/bookings",
    GET: (id) => `/admin/bookings/${id}`,
    CANCEL: (id) => `/admin/bookings/${id}/cancel`,
    STATISTICS: "/admin/bookings/statistics",
  },

  // Revenue
  REVENUE: {
    STATISTICS: "/admin/revenue/statistics",
    DETAILS: "/admin/revenue/details",
    DOWNLOAD_REPORT: "/admin/revenue/report/download",
  },

  // Audit
  AUDIT: {
    LIST: "/admin/audit-logs",
    EXPORT: "/admin/audit-logs/export",
  },

  // Admin
  ADMIN: {
    CREATE: "/admin/create-admin",
    LIST: "/admin/admins",
    DELETE: (id) => `/admin/admins/${id}`,
  },

  // Dashboard
  DASHBOARD: {
    STATISTICS: "/admin/dashboard/statistics",
    RECENT_ACTIVITY: "/admin/dashboard/recent-activity",
  },
};

/**
 * API Status Codes
 */
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Default API Configuration
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * Response Messages
 */
export const RESPONSE_MESSAGES = {
  SUCCESS: "تمت العملية بنجاح",
  ERROR: "حدث خطأ، يرجى المحاولة لاحقاً",
  UNAUTHORIZED: "الرجاء تسجيل الدخول أولاً",
  FORBIDDEN: "ليس لديك صلاحية لهذه العملية",
  NOT_FOUND: "البيانات المطلوبة غير موجودة",
  NETWORK_ERROR: "خطأ في الاتصال، تحقق من الإنترنت",
  VALIDATION_ERROR: "بيانات غير صحيحة",
};
