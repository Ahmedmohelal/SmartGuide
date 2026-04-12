import axios from 'axios';

const BASE_URL = 'https://smartguide.runasp.net/api/Auth';

const otpService = {
  // 1. إرسال كود الاسترجاع للإيميل
  sendResetOtp: async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/send-reset-otp`, { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
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
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await axios.post(`${BASE_URL}/reset-password`, { email, otp, newPassword });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error resetting password");
    }
  }
};

export default otpService;