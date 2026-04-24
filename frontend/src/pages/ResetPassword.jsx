import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import otpService from "../Services/otpService"; // السيرفس اللي فيه resetPassword
import ResetImg from "../assets/images/login.png"; // ممكن تستخدم نفس صورة اللوجن

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // بنستلم الإيميل والكود اللي بعتناهم من صفحة الـ OTP
  const email = location.state?.email;
  const otp = location.state?.otp;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // حماية: لو المستخدم دخل الصفحة دي "تهريب" من غير إيميل أو كود نرجعه
  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // بننادي السيرفس اللي إنت عملته
      const response = await otpService.resetPassword(email, otp, formData.password);

      if (response.isSuccess) {
        alert("Password reset successfully! You can now login.");
        navigate("/login");
      } else {
        setError(response.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-5xl grid md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* LEFT IMAGE */}
        <div className="hidden md:block relative overflow-hidden">
          <img src={ResetImg} alt="Reset" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-teal-900/10" />
        </div>

        {/* RIGHT FORM */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-2 text-teal-900 uppercase">Set New Password</h2>
            <p className="text-gray-500 text-sm mb-8 font-medium">
              Create a strong password to protect your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Password Input */}
              <div className="flex flex-col relative">
                <label className="text-sm font-bold text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full border-2 rounded-xl pl-10 pr-10 py-3 outline-none transition-all
                      ${error ? "border-red-500 bg-red-50" : "border-gray-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-50"}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <CheckCircle2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    className={`w-full border-2 rounded-xl pl-10 py-3 outline-none transition-all
                      ${error ? "border-red-500 bg-red-50" : "border-gray-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-50"}`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all
                  ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-800 hover:bg-teal-900 active:scale-95"}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Updating Password...
                  </div>
                ) : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}