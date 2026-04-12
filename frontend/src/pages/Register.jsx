import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Globe, Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google"; 
import authService from "../Services/authService";
import registerImage from "../assets/images/register.png"; 

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedRole = location.state?.selectedRole || "tourist";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    country: "Egypt", 
    email: "",
    password: "",
    confirmPassword: "",
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.userName.trim()) errors.userName = "Username is required";
    if (!formData.country.trim()) errors.country = "Country is required";
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // 1. تجميع البيانات الأساسية (PascalCase)
    const basicInfo = {
      FirstName: formData.firstName,
      LastName: formData.lastName,
      UserName: formData.userName,
      Country: formData.country,
      Email: formData.email,
      Password: formData.password,
      ConfirmPassword: formData.confirmPassword,
      Role: selectedRole === "guide" ? "Guide" : "Tourist"
    };

    if (selectedRole === "guide") {
      // 2. مسار المرشد: مفيش API Call هنا، بنروح لصفحة التوثيق بالداتا
      navigate("/guide-verification", { state: { basicInfo } });
    } else {
      // 3. مسار السائح: هنكلم الـ API بس هنخدعه بملفات فاضية
      setLoading(true);
      setFieldErrors({}); 
      setGeneralError("");

      try {
        const submitData = new FormData();
        
        // أ. إضافة البيانات الأساسية
        Object.keys(basicInfo).forEach(key => {
          submitData.append(key, basicInfo[key]);
        });

        // ب. التريكة: إضافة أماكن الصور فاضية عشان السيرفر ميعملش Crash
        submitData.append("ProfileImage", "");
        submitData.append("NationalIdImage", "");
        submitData.append("GuideLicenseImage", "");

        // إرسال الـ FormData للسيرفس
        await authService.register(submitData);
        
        alert("Registration successful! Please verify your email.");
        navigate("/verify-otp", { state: { email: formData.email, type: "register" } }); 

      } catch (err) {
        console.error("Backend Error Details:", err);
        let serverErrors = {};

        // محاولة التقاط أخطاء السيرفر وتوزيعها
        if (Array.isArray(err)) {
          err.forEach(e => {
            if (e.code?.includes("UserName") || e.description?.includes("User name")) {
              serverErrors.userName = e.description;
            } else if (e.code?.includes("Email") || e.description?.includes("Email")) {
              serverErrors.email = e.description;
            } else if (e.code?.includes("Password")) {
              serverErrors.password = e.description;
            } else {
              setGeneralError(e.description);
            }
          });
        } else if (err.errors) {
          Object.keys(err.errors).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('email')) serverErrors.email = err.errors[key][0];
            else if (lowerKey.includes('user')) serverErrors.userName = err.errors[key][0];
            else if (lowerKey.includes('password')) serverErrors.password = err.errors[key][0];
            else serverErrors[key] = err.errors[key][0];
          });
        } else if (typeof err === "string") {
          setGeneralError(err);
        } else {
          setGeneralError(err.message || "Registration failed. Please try again.");
        }

        if (Object.keys(serverErrors).length > 0) {
          setFieldErrors(serverErrors);
        }
      } finally {
        setLoading(false);
      }
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
        setGeneralError(err.message || "Google authentication failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setGeneralError("Google Login failed.")
  });

  const FieldError = ({ msg }) => (
    msg ? <p className="text-red-600 text-[12px] font-bold mt-1.5 ml-1 animate-pulse">{msg}</p> : null
  );

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-4 overflow-hidden">
      <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden min-h-0">
        {/* ========= LEFT IMAGE SECTION ========= */}
        <div className="hidden md:block relative min-h-0 overflow-hidden">
          <img src={registerImage} alt="Register" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-teal-900/20 to-teal-900/40 pointer-events-none" />
          <div className="absolute inset-0 z-20 flex items-start justify-start p-10 pointer-events-none">
            <h1 className="text-5xl font-bold leading-snug drop-shadow-lg text-white">
              Start Your <br /> Journey <br /> With Us
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 overflow-y-auto min-h-0 relative bg-white">
          <button onClick={() => navigate("/select-role")} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition shadow-sm">
            <ArrowLeft size={20} className="text-gray-600 hover:text-black" />
          </button>

          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold mb-1 uppercase text-teal-900 tracking-tight">Register as {selectedRole}</h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">Join our community and explore the world</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-700 mb-1 uppercase">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John"
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition ${fieldErrors.firstName ? 'border-red-500 ring-2 ring-red-100 bg-red-50' : 'focus:border-teal-600 border-gray-100'}`} />
                  <FieldError msg={fieldErrors.firstName} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-700 mb-1 uppercase">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe"
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition ${fieldErrors.lastName ? 'border-red-500 ring-2 ring-red-100 bg-red-50' : 'focus:border-teal-600 border-gray-100'}`} />
                  <FieldError msg={fieldErrors.lastName} />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1 uppercase">User Name</label>
                <div className="relative">
                  <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.userName ? 'text-red-500' : 'text-gray-400'}`} />
                  <input type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="john_doe"
                    className={`w-full border-2 rounded-xl pl-10 pr-4 py-2.5 outline-none transition ${fieldErrors.userName ? 'border-red-500 ring-2 ring-red-100 bg-red-50' : 'focus:border-teal-600 border-gray-100'}`} />
                </div>
                <FieldError msg={fieldErrors.userName} />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1 uppercase">Country</label>
                <div className="relative">
                  <Globe size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.country ? 'text-red-500' : 'text-gray-400'}`} />
                  <input type="text" name="country" value={formData.country} onChange={handleChange}
                    className={`w-full border-2 rounded-xl pl-10 pr-4 py-2.5 outline-none transition ${fieldErrors.country ? 'border-red-500 ring-2 ring-red-100 bg-red-50' : 'focus:border-teal-600 border-gray-100'}`} />
                </div>
                <FieldError msg={fieldErrors.country} />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1 uppercase">Email</label>
                <div className="relative">
                  <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-500' : 'text-gray-400'}`} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com"
                    className={`w-full border-2 rounded-xl pl-10 pr-4 py-2.5 outline-none transition ${fieldErrors.email ? 'border-red-500 ring-2 ring-red-100 bg-red-50' : 'focus:border-teal-600 border-gray-100'}`} />
                </div>
                <FieldError msg={fieldErrors.email} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col relative">
                  <label className="text-xs font-bold text-gray-700 mb-1 uppercase">Password</label>
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition ${fieldErrors.password ? 'border-red-500 ring-2 ring-red-100 bg-red-50' : 'focus:border-teal-600 border-gray-100'}`} />
                  <div className="absolute right-3 top-9 cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                  <FieldError msg={fieldErrors.password} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-xs font-bold text-gray-700 mb-1 uppercase">Confirm</label>
                  <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition ${fieldErrors.confirmPassword ? 'border-red-500 ring-2 ring-red-100 bg-red-50' : 'focus:border-teal-600 border-gray-100'}`} />
                  <div className="absolute right-3 top-9 cursor-pointer text-gray-400" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                  <FieldError msg={fieldErrors.confirmPassword} />
                </div>
              </div>

              {generalError && <p className="text-red-600 text-sm font-bold text-center bg-red-50 p-2 rounded-xl shadow-sm border border-red-100">{generalError}</p>}

              <button type="submit" disabled={loading} className={`w-full text-white py-3.5 rounded-xl transition font-bold mt-4 shadow-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-800 hover:bg-teal-900 active:scale-95"}`}>
                {loading ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20}/> Processing...</div> : (selectedRole === "guide" ? "Continue to Verification" : "Sign Up")}
              </button>
            </form>

            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <Link to="/" className="text-teal-700 font-medium">
                Sign in
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-gray-500">
              <Link to="/" className="text-teal-800 hover:underline">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}