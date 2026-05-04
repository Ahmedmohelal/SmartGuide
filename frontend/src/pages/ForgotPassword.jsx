import { useState } from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import forgotPasswordService from "../Services/forgotPasswordService";
import ForgotImg from "../assets/images/OTP.png";
import { toast } from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(""); 

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // نرسل الطلب وننتظر الرد
      const data = await forgotPasswordService.requestReset(email);

      // السيرفر في السواجر بيرجع isSuccess: true
      if (data && data.isSuccess) {
        toast.success("OTP has been sent to your email.");
        navigate("/OTP", { state: { email: email, type: "reset" } }); 
      } else {
        // لو السيرفر رجع success: false ومعاها رسالة
        setError(data?.message || "Something went wrong. Check if the email exists.");
      }

    } catch (err) {
      console.error("Forgot Password Full Error:", err);
      // هنا بنعرض الرسالة اللي جاية من الـ Catch في السيرفس
      setError(err.message || "Server Error (500). Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-5xl grid md:grid-cols-2 rounded-2xl shadow-lg overflow-hidden">
        
        {/* LEFT IMAGE */}
        <div className="hidden md:block relative min-h-[600px] overflow-hidden">
          <img src={ForgotImg} alt="Forgot Password" title="Forgot Password Illustration" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>

        {/* RIGHT FORM */}
        <div className="flex items-center justify-center p-10">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-50 rounded-full text-green-700">
                <Mail size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 uppercase tracking-tight">Forgot Password?</h2>
            <p className="text-gray-500 text-sm mb-8 font-medium">
              Don't worry! Enter your email and we'll send you an OTP to reset your password.
            </p>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="relative text-left">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wide">Email Address</label>
                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                      error ? "text-red-500" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className={`w-full px-4 py-3 pl-10 border-2 rounded-xl outline-none transition-all duration-200 ${
                      error 
                        ? "border-red-500 ring-4 ring-red-50 bg-red-50" 
                        : "border-gray-100 focus:border-green-600 focus:ring-4 focus:ring-green-50 shadow-sm"
                    }`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(""); 
                    }}
                  />
                </div>
                {error && (
                  <p className="text-red-600 text-sm mt-2 font-bold animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-green-700 hover:bg-green-800 active:scale-95 shadow-green-200"
                } flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-green-700 transition-colors uppercase tracking-widest"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}