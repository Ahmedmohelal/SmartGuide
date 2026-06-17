import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { login } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { getToken, isAdmin } from "../utils/tokenUtils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Redirect to home if already logged in
    if (getToken() && isAdmin()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message || err?.errorMessage || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--admin-bg)] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#004d40_0%,_transparent_55%)] opacity-25" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />

      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-10 admin-btn admin-btn-ghost"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-card relative z-10 w-full max-w-md p-8 shadow-xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-light text-white shadow-lg">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-extrabold">Admin sign in</h1>
          <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
            SmartGuide Egypt control panel
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary flex w-full !py-3 !text-base"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            Sign in
          </button>
        </form>
      </motion.div>
    </div>
  );
}
