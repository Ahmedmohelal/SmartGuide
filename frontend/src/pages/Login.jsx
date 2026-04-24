import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../Services/authService";
import loginImg from "../assets/images/login.png";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      console.log("البيانات اللي راجعة من اللوجن:", res);
      toast.success("Login successful! Welcome back.");
      localStorage.setItem("token", res.token);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("userId", res.id);
      if (res.roles && res.roles.length > 0) {
    // هيخزنها 'Tourist' أو 'TourGuide' زي ما جاية بالظبط
    localStorage.setItem("userRole", res.roles[0]); 
  }

      navigate("/home");
    } catch (err) {
      const msg = err.message || "Invalid email or password.";
      if (msg.toLowerCase().includes("password")) {
        setFieldErrors({ password: "The password you entered is incorrect" });
      } else if (
        msg.toLowerCase().includes("email") ||
        msg.toLowerCase().includes("user")
      ) {
        setFieldErrors({ email: "No account found with this email" });
      } else {
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="ltr"
      lang="en"
      className="flex h-screen items-center justify-center overflow-hidden bg-gray-100 p-4"
    >
      <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden min-h-0">
        {/* ========= LEFT IMAGE SECTION ========= */}
        <div className="hidden md:block relative min-h-0 overflow-hidden">
          <img
            src={loginImg}
            alt="Login"
            className="absolute inset-0 w-full h-full object-cover"
          />
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
            <h2 className="text-2xl font-bold mb-1 uppercase text-teal-900">
              Login to Your Account
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Enter your email and password
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-base font-medium text-gray-700 flex flex-col gap-2">
                  Email
                  <div
                    className={`flex items-center gap-2 border py-3 p-2 rounded-lg transition-all ${
                      errors.email
                        ? "border-red-600 ring-1 ring-red-600 bg-red-50"
                        : "focus-within:ring-2 focus-within:ring-teal-600 focus-within:border-teal-600 border-gray-300"
                    }`}
                  >
                    <Mail
                      size={18}
                      className={
                        errors.email ? "text-red-600" : "text-gray-400"
                      }
                    />

                    <div className="flex items-center justify-between gap-2 w-full">
                      <input
                        type="email"
                        name="email"
                        {...register("email", {
                          required: "Email is required",
                        })}
                        placeholder="example@email.com"
                        className="w-full bg-transparent outline-none border-none focus:ring-0"
                      />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </label>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 flex flex-col gap-2">
                  Password
                  <div
                    className={`flex items-center gap-2  border  py-3 p-2 rounded-lg  ${errors.password ? "border-red-600 ring-1 ring-red-600 bg-red-50" : "focus-within:ring-2 focus-within:ring-teal-600 focus-within:border-gray-300"}`}
                  >
                    <Lock size={18} />

                    <div className="flex items-center justify-between gap-2 w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        {...register("password", {
                          required: "Password is required",
                        })}
                        placeholder="Enter your password"
                        className="w-full"
                      />

                      {showPassword ? (
                        <Eye
                          size={18}
                          className="flex justify-end cursor-pointer text-gray-400 "
                          onClick={() => setShowPassword(false)}
                        />
                      ) : (
                        <EyeOff
                          size={18}
                          className="flex justify-end cursor-pointer text-gray-400 "
                          onClick={() => setShowPassword(true)}
                        />
                      )}
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </label>

                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-teal-700 hover:text-teal-900 font-bold transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {generalError && (
                <p className="text-red-600 text-sm font-bold text-center bg-red-50 p-2 rounded">
                  {generalError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white py-2 rounded-lg transition font-bold shadow-md ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-800 hover:bg-teal-900"}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Loader2 className="animate-spin" size={20} /> Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-400 text-xs italic font-bold uppercase tracking-widest">
                Or
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
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
                  navigate("/");
                } catch (err) {
                  setGeneralError(err.message || "Google login failed.");
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => setGeneralError("Google Login failed.")}
            />

            <p className="text-sm text-center mt-6 text-gray-600 font-medium">
              Don't have an account?{" "}
              <Link
                to="/select-role"
                className="text-teal-700 font-bold hover:underline ml-1"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
