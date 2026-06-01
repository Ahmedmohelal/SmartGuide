import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Map,
  CalendarDays,
  Banknote,
  ScrollText,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { PUBLIC_SITE_URL } from "../config/api";
import { logout } from "../services/authService";
import toast from "react-hot-toast";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/guides/pending", icon: UserCheck, label: "Approve / Reject" },
  { to: "/guides", icon: Users, label: "Manage guides" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/tours", icon: Map, label: "Tours" },
  { to: "/bookings", icon: CalendarDays, label: "Bookings" },
  { to: "/revenue", icon: Banknote, label: "Revenue" },
  { to: "/audit", icon: ScrollText, label: "Audit logs" },
];

function SidebarContent({ name, onNavigate }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
          SmartGuide Egypt
        </p>
        <h1 className="mt-1 text-lg font-extrabold text-white">Admin Panel</h1>
        <p className="mt-2 truncate text-xs text-white/65">{name}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} strokeWidth={2.25} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-4">
        <a
          href={`${PUBLIC_SITE_URL}/home`}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn admin-btn-gold flex w-full !text-sm"
        >
          <ExternalLink size={16} />
          Open main site
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="admin-btn flex w-full border border-white/20 bg-white/10 !text-sm text-white hover:bg-white/15"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const name = localStorage.getItem("adminName") || "Admin";

  const closeMobile = () => setOpen(false);

  return (
    <div className="min-h-screen bg-[var(--admin-bg)]">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 flex-col text-white lg:flex">
        <SidebarContent name={name} onNavigate={closeMobile} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="admin-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col lg:hidden"
            >
              <button
                type="button"
                className="absolute right-3 top-3 z-10 rounded-lg bg-white/15 p-2 text-white"
                onClick={closeMobile}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
              <SidebarContent name={name} onNavigate={closeMobile} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-glass)] px-4 py-3 shadow-sm backdrop-blur-md lg:px-8">
          <button
            type="button"
            className="admin-btn admin-btn-ghost !p-2.5 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <p className="hidden flex-1 text-sm font-medium text-[var(--admin-text-muted)] sm:block">
            SmartGuide platform administration
          </p>
          <button
            type="button"
            onClick={toggleTheme}
            className="admin-btn admin-btn-ghost ml-auto !text-sm"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden sm:inline">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
