/**
 * Central Export for All Constants
 * هذا الملف يجميع جميع الثوابت من ملفات مختلفة
 */

export * from "./api";
export * from "./roles";

// App Constants
export const APP_NAME = import.meta.env.VITE_APP_NAME || "SmartGuide Admin";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || "admin_auth_token";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZES = [10, 20, 50, 100];

// Date Format
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

// Status
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

// Colors
export const COLORS = {
  PRIMARY: "#3B82F6",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  DANGER: "#EF4444",
  SECONDARY: "#6B7280",
  LIGHT: "#F9FAFB",
  DARK: "#1F2937",
};

// Chart Colors
export const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
