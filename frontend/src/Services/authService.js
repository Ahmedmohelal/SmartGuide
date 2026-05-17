import axios from "axios";
import { ENDPOINTS } from "../config/api";
import { refreshAccessToken } from "./refreshAuth";
import {
  authHeader,
  clearAuthStorage,
  persistAuthFromResponse,
} from "./utils/tokenUtils";

const authService = {
  login: async (userData) => {
    try {
      const response = await axios.post(`${ENDPOINTS.AUTH}/login`, userData);
      persistAuthFromResponse(response.data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  register: async (formDataContent) => {
    try {
      const response = await axios.post(
        `${ENDPOINTS.AUTH}/register`,
        formDataContent
      );
      return response.data;
    } catch (error) {
      const body = error.response?.data;
      console.error(
        "Register Error Details:",
        body ?? { networkMessage: error.message, code: error.code }
      );
      if (error.response) {
        throw error.response.data;
      }
      const msg =
        error.code === "ERR_NETWORK" || error.message === "Network Error"
          ? "Could not connect to the server. Check your internet or try again later."
          : error.message || "Registration Failed";
      throw new Error(msg);
    }
  },

  googleLogin: async (googleToken) => {
    try {
      const response = await axios.post(`${ENDPOINTS.AUTH}/google-login`, {
        idToken: googleToken,
      });
      return response.data;
    } catch (error) {
      console.log("Google Login Error:", error.response);
      throw error.response?.data?.message || "Google Login Failed";
    }
  },

  /** POST /api/Auth/refreshtoken — renew access + refresh tokens */
  refreshToken: async () => {
    try {
      const token = await refreshAccessToken();
      return { token };
    } catch (error) {
      throw error.response?.data ?? error;
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const token = localStorage.getItem("token");

    try {
      if (refreshToken && token) {
        await axios.post(
          `${ENDPOINTS.AUTH}/logout`,
          { refreshToken },
          { headers: authHeader() }
        );
      }
    } catch {
      // Still clear local session if server logout fails
    } finally {
      clearAuthStorage();
    }
  },
};

export default authService;
