import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { createAdmin } from "../services/adminService";

export default function CreateAdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    whatsAppNumber: "",
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }
    if (!formData.whatsAppNumber.trim()) {
      newErrors.whatsAppNumber = "WhatsApp number is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        FirstName: formData.firstName,
        LastName: formData.lastName,
        UserName: formData.userName,
        Email: formData.email,
        Password: formData.password,
        Country: formData.country,
        WhatsAppNumber: formData.whatsAppNumber,
      };

      console.log("=== ADMIN PAYLOAD ===");
      console.log("FirstName:", payload.FirstName);
      console.log("LastName:", payload.LastName);
      console.log("UserName:", payload.UserName);
      console.log("Email:", payload.Email);
      console.log("Password:", payload.Password);
      console.log("Country:", payload.Country);
      console.log("WhatsAppNumber:", payload.WhatsAppNumber);
      console.log("Full payload:", payload);

      await createAdmin(payload);

      toast.success("Admin created successfully!");
      setTimeout(() => navigate("/users"), 1000);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to create admin";

      console.error("=== CREATE ADMIN ERROR ===");
      console.error("Status:", err.response?.status);
      console.error("Message:", message);
      console.error("Response:", err.response?.data);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Create New Admin"
        subtitle="Add a new administrator account to the platform."
      >
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="admin-btn admin-btn-ghost flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>
      </PageHeader>

      <div className="mx-auto w-full max-w-md">
        <div className="admin-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold mb-2"
              >
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="admin-input"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-semibold mb-2"
              >
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="admin-input"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-semibold mb-2"
              >
                Username *
              </label>
              <input
                id="userName"
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="johndoe"
                className="admin-input"
              />
              {errors.userName && (
                <p className="mt-1 text-xs text-red-500">{errors.userName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="admin-input"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-semibold mb-2"
              >
                Country *
              </label>
              <input
                id="country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Egypt"
                className="admin-input"
              />
              {errors.country && (
                <p className="mt-1 text-xs text-red-500">{errors.country}</p>
              )}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label
                htmlFor="whatsAppNumber"
                className="block text-sm font-semibold mb-2"
              >
                WhatsApp Number *
              </label>
              <input
                id="whatsAppNumber"
                type="tel"
                name="whatsAppNumber"
                value={formData.whatsAppNumber}
                onChange={handleChange}
                placeholder="+20 100 000 0000"
                className="admin-input"
              />
              {errors.whatsAppNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.whatsAppNumber}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-2"
              >
                Password *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="admin-input"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold mb-2"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="admin-input"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn-primary w-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="inline animate-spin mr-2" size={18} />
                  Creating Admin…
                </>
              ) : (
                "Create Admin"
              )}
            </button>

            {/* Back Link */}
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="admin-btn admin-btn-ghost w-full"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
