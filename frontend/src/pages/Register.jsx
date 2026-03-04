import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import registerImage from "../assets/images/register.png";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // لما الباك يبجهز
    console.log(formData);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-4 overflow-hidden">
      <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden min-h-0">
        {/* ========= LEFT IMAGE SECTION ========= */}
        <div className="hidden md:block relative min-h-0 overflow-hidden">
          <img
            src={registerImage}
            alt="Register"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-violet-400/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-20 flex items-start justify-start p-10 pointer-events-none">
            <h1 className="text-5xl font-bold leading-snug drop-shadow-lg bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Start Your <br /> Journey <br /> With Us
            </h1>
          </div>
        </div>

        {/* ========= RIGHT FORM SECTION ========= */}
        <div className="flex items-center justify-center p-8 overflow-y-auto min-h-0">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-1">Get Started Now</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Let’s create your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative mt-1">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative mt-1">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative mt-1">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full border rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative mt-1">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full border rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" required />
                <span>
                  I agree to{" "}
                  <span className="text-teal-700 font-medium cursor-pointer">
                    Terms & Conditions
                  </span>
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-800 text-white py-2 rounded-lg hover:bg-teal-900 transition"
              >
                Sign up
              </button>
            </form>

            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <Link to="/" className="text-teal-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
