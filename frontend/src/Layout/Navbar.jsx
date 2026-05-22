import { useState, useEffect } from "react";
import { navLinks } from "../data/homeContent";
import { Menu, X, CircleUserRound, User, Settings, Headphones, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useProfile } from "../Context/ProfileContext";
import { HashLink } from "react-router-hash-link";
import { isGuide } from "../Services/utils/tokenUtils";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { logout, user } = useProfile();
  const isLightBackgroundPage =
    location.pathname === "/profile" || 
    location.pathname === "/support" || 
    location.pathname.startsWith("/guides/");
  const navTextClass =
    !isScrolled && isLightBackgroundPage ? "text-gray-800" : "text-white";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) { // قللت الرقم شوية عشان التفاعل يبان أسرع، تقدر ترجعه 650 لو حابب
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="fixed inset-x-0 top-2 z-50 w-full px-4" dir="ltr">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 transition-all duration-400 ease-in-out ${
          isScrolled
            ? "bg-slate-900/60 backdrop-blur-md shadow-2xl rounded-3xl  border border-white/10" 
            : "bg-transparent py-3 rounded-none border border-transparent"
        }`}
      >
        {/* ========================================== */}
        {/* 1. الجانب الأيمن: أيقونة البروفايل */}
        {/* ========================================== */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden focus:outline-none transition-transform duration-200 ${navTextClass}`}
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>

          <div className="hidden md:block relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center justify-center p-1 rounded-full transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none ${
                isProfileOpen
                  ? "bg-white/20 text-white ring-2 ring-white/50"
                  : `${navTextClass} hover:bg-white/10 hover:text-egypt-teal`
              }`}
            >
              {user?.profilePicture || user?.touristImage ? (
                <img
                  src={user.profilePicture || user.touristImage}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
                />
              ) : (
                <CircleUserRound className="w-9 h-9" strokeWidth={1.5} />
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 rounded-xl bg-white/90 shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden transition-all">
                <div className="py-2">
                  <Link onClick={() => setIsProfileOpen(false)} to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"><User className="w-5 h-5" /> My Account</Link>
                  <Link onClick={() => setIsProfileOpen(false)} to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"><Settings className="w-5 h-5" /> Settings</Link>
                  {!isGuide() && (
                    <>
                      <Link onClick={() => setIsProfileOpen(false)} to="/saved-places" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"><User className="w-5 h-5" /> Saved Places</Link>
                      <Link onClick={() => setIsProfileOpen(false)} to="/saved-guides" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"><User className="w-5 h-5" /> Saved Guides</Link>
                    </>
                  )}
                  <Link onClick={() => setIsProfileOpen(false)} to="/support" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"><Headphones className="w-5 h-5" /> Support</Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition font-bold"
                  >
                    <LogOut className="w-5 h-5" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* 2. المنتصف: لينكات الموقع (تم التعديل هنا) */}
        {/* ========================================== */}
        <ul className={`hidden flex-1 items-center justify-center gap-6 text-sm font-semibold md:flex ${navTextClass}`}>
          {navLinks.map((item) => {
            const isExternalRoute = item.href.startsWith("/");
            const targetPath = isExternalRoute ? item.href : `/home${item.href}`;
            const isActive = isExternalRoute
              ? location.pathname === item.href
              : location.hash === item.href || (location.hash === "" && item.href === "#hero" && location.pathname === "/home");

            return (
              <li key={item.href} className="relative flex flex-col items-center">
                {isExternalRoute ? (
                  <Link
                    to={targetPath}
                    className={`rounded-full px-3 py-2 transition duration-300 ${
                      isActive ? "bg-white/15" : "hover:bg-white/15"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <HashLink
                    smooth
                    to={targetPath}
                    scroll={(el) => el.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className={`rounded-full px-3 py-2 transition duration-300 ${
                      isActive ? "bg-white/15" : "hover:bg-white/15"
                    }`}
                  >
                    {item.label}
                  </HashLink>
                )}

                {isActive && (
                  <span className="absolute -bottom-4 h-0 w-0 border-l-6 border-r-6 border-b-8 border-l-transparent border-r-transparent border-b-white transition-all duration-300"></span>
                )}
              </li>
            );
          })}
        </ul>

        {/* ========================================== */}
        {/* 3. الجانب الأيسر: اللوجو */}
        {/* ========================================== */}
        <Link to="/" className="flex shrink-0 items-center justify-center">
          <img src="/logo.png" alt="Smart Guide Logo" className="h-24 w-auto object-contain transition-all duration-300" />
        </Link>
      </nav>

      {/* ========================================== */}
      {/* 4. قائمة الموبايل (تم التعديل هنا كمان) */}
      {/* ========================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md absolute top-full left-0 w-full px-4 py-6 shadow-xl border-t border-white/20 transition-all duration-300 max-h-[85vh] overflow-y-auto mt-2 rounded-2xl">
          <ul className="flex flex-col items-center gap-2 text-base font-semibold text-white">
            {navLinks.map((item) => {
              const isExternalRoute = item.href.startsWith("/");
              const targetPath = isExternalRoute ? item.href : `/home${item.href}`;

              return (
                <li key={item.href} className="w-full text-center">
                  {isExternalRoute ? (
                    <Link
                      to={targetPath}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-3 transition hover:bg-white/10 w-full"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <HashLink
                      smooth
                      to={targetPath}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-3 transition hover:bg-white/10 w-full"
                    >
                      {item.label}
                    </HashLink>
                  )}
                </li>
              );
            })}
          </ul>
          
          <div className="my-5 border-t border-white/20 w-3/4 mx-auto"></div>
          
          {/* لينكات البروفايل في الموبايل */}
          <ul className="flex flex-col items-center gap-2 text-sm font-medium text-gray-300">
            <li className="w-full text-center"><Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 hover:text-white transition"><User className="w-5 h-5" /> My Account</Link></li>
            <li className="w-full text-center"><Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 hover:text-white transition"><Settings className="w-5 h-5" /> Settings</Link></li>
            {!isGuide() && (
              <>
                <li className="w-full text-center"><Link to="/saved-places" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 hover:text-white transition"><User className="w-5 h-5" /> Saved Places</Link></li>
                <li className="w-full text-center"><Link to="/saved-guides" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 hover:text-white transition"><User className="w-5 h-5" /> Saved Guides</Link></li>
              </>
            )}
            <li className="w-full text-center"><Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 hover:text-white transition"><Headphones className="w-5 h-5" /> Support</Link></li>
            <li className="w-full text-center mt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 py-3 text-red-500 hover:text-red-400 font-bold transition bg-red-500/10 rounded-lg"
              >
                <LogOut className="w-5 h-5" /> Log Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}