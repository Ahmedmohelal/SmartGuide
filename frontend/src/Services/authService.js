import axios from 'axios';

const BASE_URL = 'http://smartguide.runasp.net/api/Auth';

const authService = {
  login: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  // رجعناها تقبل FormData زي الأول
  register: async (formDataContent) => {
    try {
      // الـ axios هيظبط الـ Headers لوحده عشان ده FormData
      const response = await axios.post(`${BASE_URL}/register`, formDataContent);
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
    const response = await axios.post(`${BASE_URL}/google-login`, {
      idToken: googleToken,
    });

    return response.data;
  } catch (error) {
    console.log("Google Login Error:", error.response); // 👈 مهم في الديبج

    throw error.response?.data?.message || "Google Login Failed";
  }
}
};

export default authService;