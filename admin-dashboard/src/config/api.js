export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://smartguide.runasp.net/api";

export const PUBLIC_SITE_URL =
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5174";

export const ENDPOINTS = {
  AUTH: `${API_BASE}/Auth`,
  ADMIN: `${API_BASE}/admin`,
};
