import axios from "axios";
import { refreshAccessToken } from "./refreshAuth";
import { clearAuthStorage, getToken } from "../utils/tokenUtils";

const SKIP = ["/Auth/login", "/Auth/refreshtoken"];

let isRefreshing = false;
let queue = [];

const drain = (err, token) => {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)));
  queue = [];
};

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers?.Authorization) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
});

axios.interceptors.response.use(
  (r) => r,
  async (error) => {
    const req = error.config;
    if (
      error.response?.status !== 401 ||
      !req ||
      req._retry ||
      SKIP.some((p) => req.url?.includes(p))
    ) {
      return Promise.reject(error);
    }

    if (!localStorage.getItem("refreshToken")) {
      clearAuthStorage();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        req.headers.Authorization = `Bearer ${token}`;
        return axios(req);
      });
    }

    req._retry = true;
    isRefreshing = true;
    try {
      const token = await refreshAccessToken();
      drain(null, token);
      req.headers.Authorization = `Bearer ${token}`;
      return axios(req);
    } catch (e) {
      drain(e, null);
      clearAuthStorage();
      window.location.href = "/login";
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
