import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Globe,
  Loader2,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../Services/authService";
import registerImage from "../assets/images/register.png";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedRole = location.state?.selectedRole || "tourist";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      country: "Egypt",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    const basicInfo = {
      FirstName: data.firstName,
      LastName: data.lastName,
      UserName: data.userName,
      Country: data.country,
      Email: data.email,
      Password: data.password,
      ConfirmPassword: data.confirmPassword,
      Role: selectedRole === "guide" ? "TourGuide" : "Tourist",
    };

    if (selectedRole === "guide") {
      console.log("Guide basic info:", basicInfo);
      navigate("/guide-verification", { state: { basicInfo } });
      return;
    }

    setLoading(true);
    setFieldErrors({});
    setGeneralError("");

    try {
      const submitData = new FormData();

      Object.keys(basicInfo).forEach((key) => {
        submitData.append(key, basicInfo[key]);
      });

      await authService.register(submitData);

      
      toast.success("Registration successful! Welcome to Smart Guide.");

      navigate("/login", {
        state: { email: data.email, type: "register" },
      });
    } catch (err) {
      console.error("Backend Error Details:", err);

      let serverErrors = {};

      if (Array.isArray(err)) {
        err.forEach((e) => {
          const desc = e.description?.toLowerCase() || "";

          if (desc.includes("user name")) serverErrors.userName = e.description;
          else if (desc.includes("email")) serverErrors.email = e.description;
          else if (desc.includes("password"))
            serverErrors.password = e.description;
          else setGeneralError(e.description);
        });
      } else if (err?.errors) {
        Object.keys(err.errors).forEach((key) => {
          const lowerKey = key.toLowerCase();

          if (lowerKey.includes("email")) {
            serverErrors.email = err.errors[key][0];
          } else if (lowerKey.includes("user")) {
            serverErrors.userName = err.errors[key][0];
          } else if (lowerKey.includes("password")) {
            serverErrors.password = err.errors[key][0];
          } else {
            serverErrors[key] = err.errors[key][0];
          }
        });
      } else {
        setGeneralError(
          err.message || "Registration failed. Please try again.",
        );
      }

      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };



  const FieldError = ({ msg }) =>
    msg ? (
      <p className="text-red-600 text-[12px] font-bold mt-1.5 ml-1 animate-pulse">
        {msg}
      </p>
    ) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 ">
      <div className="w-full max-w-5xl md:h-[95vh] h-auto bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden ">
        {/* ========= LEFT IMAGE SECTION ========= */}
        <div className="hidden md:block relative min-h-0 overflow-hidden">
          <img
            src={registerImage}
            alt="Register"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-teal-900/20 to-teal-900/40 pointer-events-none" />
          <div className="absolute inset-0 z-20 flex items-start justify-start p-10 pointer-events-none">
            <h1 className="text-5xl font-bold leading-snug drop-shadow-lg text-white">
              Start Your <br /> Journey <br /> With Us
            </h1>
          </div>
        </div>

        {/* ========= RIGHT FORM SECTION ========= */}
        <div className="flex items-center justify-center p-6 overflow-y-auto min-h-0 relative bg-white">
          <button
            onClick={() => navigate("/select-role")}
            className="absolute md:top-11 md:right-9 top-6 right-3 p-2 rounded-full hover:bg-gray-100 transition shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-600 hover:text-black" />
          </button>

          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold mb-1 uppercase text-teal-900 tracking-tight">
              Register as {selectedRole}
            </h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">
              Join our community and explore the world
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-700 mb-1 uppercase">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    placeholder="John"
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition ${fieldErrors.firstName ? "border-red-500 ring-2 ring-red-100 bg-red-50" : "focus:border-teal-600 border-gray-100"}`}
                  />
                  {errors.firstName && (<FieldError msg={errors.firstName.message} />
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-700 mb-1 uppercase">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                    placeholder="Doe"
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition ${fieldErrors.lastName ? "border-red-500 ring-2 ring-red-100 bg-red-50" : "focus:border-teal-600 border-gray-100"}`}
                  />
                  {errors.lastName && (
                    <FieldError msg={errors.lastName.message} />
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1 uppercase">
                  User Name
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.userName ? "text-red-500" : "text-gray-400"}`}
                  />
                  <input
                    type="text"
                    name="userName"
                    {...register("userName", {
                      required: "User name is required",
                    })}
                    placeholder="john_doe"
                    className={`w-full border-2 rounded-xl pl-10 pr-4 py-2.5 outline-none transition ${fieldErrors.userName ? "border-red-500 ring-2 ring-red-100 bg-red-50" : "focus:border-teal-600 border-gray-100"}`}
                  />
                </div>
                {errors.userName && (
                  <FieldError msg={errors.userName.message} />
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1 uppercase">
                  Country
                </label>
                <div className="relative">
                  <Globe
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.country ? "text-red-500" : "text-gray-400"}`}
                  />
                  <input
                    type="text"
                    name="country"
                    {...register("country", {
                      required: "Country is required",
                    })}
                    className={`w-full border-2 rounded-xl pl-10 pr-4 py-2.5 outline-none transition ${fieldErrors.country ? "border-red-500 ring-2 ring-red-100 bg-red-50" : "focus:border-teal-600 border-gray-100"}`}
                  />
                </div>
                {errors.country && <FieldError msg={errors.country.message} />}
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1 uppercase">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.email ? "text-red-500" : "text-gray-400"}`}
                  />
                  <input
                    type="email"
                    name="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder="example@email.com"
                    className={`w-full border-2 rounded-xl pl-10 pr-4 py-2.5 outline-none transition ${fieldErrors.email ? "border-red-500 ring-2 ring-red-100 bg-red-50" : "focus:border-teal-600 border-gray-100"}`}
                  />
                </div>
                {errors.email && <FieldError msg={errors.email.message} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col relative">
                  <label className="text-xs font-bold text-gray-700 mb-1 uppercase">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition ${fieldErrors.password ? "border-red-500 ring-2 ring-red-100 bg-red-50" : "focus:border-teal-600 border-gray-100"}`}
                  />
                  <div
                    className="absolute right-3 top-9 cursor-pointer text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                  {errors.password && (
                    <FieldError msg={errors.password.message} />
                  )}
                </div>
                <div className="flex flex-col relative">
                  <label className="text-xs font-bold text-gray-700 mb-1 uppercase">
                    Confirm
                  </label>
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    {...register("confirmPassword", {
                      required: "Confirm password is required",
                    })}
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition ${fieldErrors.confirmPassword ? "border-red-500 ring-2 ring-red-100 bg-red-50" : "focus:border-teal-600 border-gray-100"}`}
                  />
                  <div
                    className="absolute right-3 top-9 cursor-pointer text-gray-400"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                  {errors.confirmPassword && (
                    <FieldError msg={errors.confirmPassword.message} />
                  )}
                </div>
              </div>

              {generalError && (
                <p className="text-red-600 text-sm font-bold text-center bg-red-50 p-2 rounded-xl shadow-sm border border-red-100">
                  {generalError}
                </p>
              )}

              <button
                type="submit" // خليه دايماً submit لكل الأدوار
                disabled={loading}
                className={`w-full text-white py-3.5 rounded-xl transition font-bold mt-4 shadow-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-800 hover:bg-teal-900 active:scale-95"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} /> Processing...
                  </div>
                ) : selectedRole === "guide" ? (
                  "Continue to Verification"
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            {/* خط الفاصل "Or" */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-gray-400 text-xs italic font-bold uppercase tracking-widest">
                Or
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

           <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                setGeneralError("");

                try {
                  const data = await authService.googleLogin(
                    credentialResponse.credential,
                  );

                  localStorage.setItem("token", data.accessToken);
                  localStorage.setItem("refreshToken", data.refreshToken);
                  navigate("/home");
                } catch (err) {
                  setGeneralError(err.message || "Google login failed.");
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => setGeneralError("Google Login failed.")}
            />

            <p className="text-sm text-center mt-6 text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal-700 font-bold hover:underline ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
