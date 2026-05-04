import axios from 'axios';

const BASE_URL = 'http://smartguide.runasp.net/api/Auth';

const otpService = {
  // 1. إرسال كود الاسترجاع للإيميل
  sendResetOtp: async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/send-reset-otp`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Network Error");
    }
  },

  // 2. التأكد من صحة الكود
  verifyResetOtp: async (email, otp) => {
    try {
      const response = await axios.post(`${BASE_URL}/verify-reset-otp`, { email, otp });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Invalid OTP");
    }
  },

  // 3. تعيين كلمة سر جديدة
  resetPassword: async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await axios.post(`${BASE_URL}/reset-password`, { email, otp, newPassword, confirmPassword });
      return response.data;
    } catch (error) {
      console.error("Server Error Details:", error.response?.data);
      throw error.response ? error.response.data : new Error("Error resetting password");
    }
  }
};

export default otpService;