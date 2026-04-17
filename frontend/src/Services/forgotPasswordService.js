import axios from 'axios';

const BASE_URL = 'http://smartguide.runasp.net/api/Auth';

const forgotPasswordService = {
  // دالة إرسال طلب نسيان كلمة السر
  requestReset: async (email) => {
    try {
      // ملحوظة: في الصورة الأولى كان عندك 2 endpoints
      // /forgot-password و /send-reset-otp
      // استخدم اللي الباك إند شغال عليه فيهم للخطوة الأولى
      const response = await axios.post(`${BASE_URL}/send-reset-otp`, { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Failed to send OTP");
    }
  }
};

export default forgotPasswordService;