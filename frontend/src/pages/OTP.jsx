import { useState, useRef, useEffect } from "react";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import otpService from "../Services/otpService"; // تأكد من المسار
import OTPImg from "../assets/images/OTP.png";
import { toast } from "react-hot-toast";

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  // استلام البيانات من الصفحة السابقة (email و type)
  const email = location.state?.email;
  const type = location.state?.type || "reset"; 

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  // حماية للصفحة: لو مفيش إيميل يرجعه للوجن
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;
    const newOtp = paste.split("").concat(new Array(6 - paste.length).fill(""));
    setOtp(newOtp.slice(0, 6));
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // استخدام السيرفس المعدل بالـ Proxy
      // ملاحظة: لو النوع register حالياً الباك إند مخلصهاش، فهنشتغل على الـ reset
      const data = await otpService.verifyResetOtp(email, fullOtp);

      if (data.isSuccess) {
        toast.success("Verified Successfully!");
        if (type === "register") {
          navigate("/login");
        } else {
          // نبعت الـ email والـ otp لصفحة تغيير الباسورد عشان هنحتاجهم
          navigate("/reset-password", { state: { email, otp: fullOtp } });
        }
      } else {
        setError(data.message || "Invalid OTP code");
      }
      
    } catch (err) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await otpService.sendResetOtp(email);
      alert("A new code has been sent to your email");
    } catch (error) {
      setError(error?.message || "Error resending code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-5xl grid md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* LEFT IMAGE */}
        <div className="hidden md:block relative overflow-hidden">
          <img src={OTPImg} alt="OTP" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-green-900/10" />
        </div>

        {/* RIGHT FORM */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-50 rounded-full text-green-700">
                <Lock size={40} />
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-2 text-gray-800">
              {type === "register" ? "Confirm Email" : "OTP Verification"}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              We've sent a 6-digit code to <br />
              <span className="font-bold text-gray-700">{email}</span>
            </p>

            {/* OTP INPUTS */}
            <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all outline-none
                    ${error ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-100"}`}
                />
              ))}
            </div>

            {error && <p className="text-red-600 text-sm font-bold mb-6 animate-bounce">{error}</p>}

            {/* VERIFY BUTTON */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all
                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 active:scale-95"}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Verifying...
                </div>
              ) : "Verify Code"}
            </button>

            {/* RESEND */}
            <p className="text-sm text-gray-500 mt-8">
              Didn’t receive the code?{" "}
              <button 
                onClick={handleResend}
                disabled={loading}
                className="text-green-700 font-bold hover:underline disabled:text-gray-400"
              >
                Resend New Code
              </button>
            </p>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}