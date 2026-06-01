import axios from "axios";
import { ENDPOINTS } from "../config/api";
import {
  clearAuthStorage,
  persistAuthFromResponse,
} from "../utils/tokenUtils";

export const login = async (email, password) => {
  const { data } = await axios.post(`${ENDPOINTS.AUTH}/login`, {
    email,
    password,
  });

  const roles = data.roles || [];
  const isAdminRole = roles.some((r) => r.toLowerCase() === "admin");
  if (!isAdminRole) {
    throw new Error("This account is not an administrator.");
  }

  persistAuthFromResponse(data);
  localStorage.setItem("adminName", data.userName || data.email || "Admin");
  localStorage.setItem("adminEmail", data.email || "");
  return data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const token = localStorage.getItem("token");
  try {
    if (refreshToken && token) {
      await axios.post(
        `${ENDPOINTS.AUTH}/logout`,
        { refreshToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  } catch {
    /* ignore */
  } finally {
    clearAuthStorage();
  }
};
