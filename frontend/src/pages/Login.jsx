import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google"; 
import authService from "../Services/authService";
import loginImg from "../assets/images/login.png"; 

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    setGeneralError("");
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await authService.login(formData);
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/");
    } catch (err) {
      const msg = err.message || "Invalid email or password.";
      if (msg.toLowerCase().includes("password")) {
        setFieldErrors({ password: "The password you entered is incorrect" });
      } else if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("user")) {
        setFieldErrors({ email: "No account found with this email" });
      } else {
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setGeneralError("");
      try {
        const data = await authService.googleLogin(tokenResponse.access_token);
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/");
      } catch (err) {
        setGeneralError(err.message || "Google login failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setGeneralError("Google Login failed.")
  });

  // مكوّن نص الخطأ (تم تكبير الخط لـ text-sm وتحسين الوضوح)
  const ErrorMessage = ({ msg }) => (
    msg ? <p className="text-red-600 text-sm mt-1 font-bold animate-pulse">{msg}</p> : null
  );

  return (
    <div
      dir="ltr"
      lang="en"
      className="flex h-screen items-center justify-center overflow-hidden bg-gray-100 p-4"
    >
      <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden min-h-0">
        
        {/* ========= LEFT IMAGE SECTION ========= */}
        <div className="hidden md:block relative min-h-0 overflow-hidden">
          <img src={loginImg} alt="Login" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-violet-400/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-20 flex items-start justify-start p-10 pointer-events-none">
            <h1 className="text-5xl font-bold leading-snug drop-shadow-lg bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Welcome <br /> Back <br /> Again
            </h1>
          </div>
        </div>

        {/* ========= RIGHT FORM SECTION ========= */}
        <div className="flex items-center justify-center p-8 overflow-y-auto min-h-0 relative">
          <div className="w-full max-w-md">
            
            <h2 className="text-2xl font-bold mb-1 uppercase text-teal-900">Login to Your Account</h2>
            <p className="text-gray-500 mb-6 text-sm">Enter your email and password</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* EMAIL */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative mt-1">
                  <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-600' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`w-full border rounded-lg pl-10 pr-3 py-2 outline-none transition ${fieldErrors.email ? 'border-red-600 ring-1 ring-red-600 bg-red-50' : 'focus:ring-2 focus:ring-teal-600 border-gray-300'}`}
                  />
                </div>
                <ErrorMessage msg={fieldErrors.email} />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.password ? 'text-red-600' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full border rounded-lg pl-10 pr-10 py-2 outline-none transition ${fieldErrors.password ? 'border-red-600 ring-1 ring-red-600 bg-red-50' : 'focus:ring-2 focus:ring-teal-600 border-gray-300'}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
                <ErrorMessage msg={fieldErrors.password} />
                
                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-sm text-teal-700 hover:text-teal-900 font-bold transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {generalError && <p className="text-red-600 text-sm font-bold text-center bg-red-50 p-2 rounded">{generalError}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white py-2 rounded-lg transition font-bold shadow-md ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-800 hover:bg-teal-900"}`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-400 text-xs italic font-bold uppercase">Or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Google
            </button>

            <p className="text-sm text-center mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-teal-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}