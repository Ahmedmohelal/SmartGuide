import axios from "axios";
import { refreshAccessToken } from "./refreshAuth";
import { clearAuthStorage, getToken } from "./utils/tokenUtils";

const AUTH_SKIP_REFRESH_PATHS = [
  "/Auth/login",
  "/Auth/register",
  "/Auth/refreshtoken",
  "/Auth/google-login",
  "/Auth/send-reset-otp",
  "/Auth/verify-reset-otp",
  "/Auth/reset-password",
  "/Auth/forgot-password",
];

const shouldSkipRefresh = (url) =>
  AUTH_SKIP_REFRESH_PATHS.some((path) => url?.includes(path));

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  clearAuthStorage();
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
