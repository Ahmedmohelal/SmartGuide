import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logosg from "../../assets/images/logosg.png";
import { navLinks } from "../../data/homeContent";

const NAV_ORANGE = "text-[#ff8c00]";
const NAV_ORANGE_BORDER = "border-b-[#ff8c00]";

function navItemActive(href, activeHash) {
  if (href === "#hero")
    return activeHash === "" || activeHash === "#hero";
  return activeHash === href;
}

export default function HomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(
    () => (typeof window !== "undefined" ? window.location.hash : "") || "",
  );
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const sync = () => setActiveHash(window.location.hash || "");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("hero");
      const heroBottom = el ? el.offsetTop + el.offsetHeight : window.innerHeight;
      setOverHero(window.scrollY < heroBottom - 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const headerGlass = overHero
    ? "border-white/20 bg-transparent shadow-none backdrop-blur-none"
    : "";
  const headerScrolled = overHero
    ? ""
    : "border-white/10 bg-black/50 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md";
  const linkShadow = overHero
    ? "[text-shadow:0_1px_4px_rgb(0_0_0/0.85),0_0_12px_rgb(0_0_0/0.35)]"
    : "";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full border-b transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ${headerGlass} ${headerScrolled}`}
    >
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          to="/"
          className={`flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 sm:gap-3 ${overHero ? "drop-shadow-[0_2px_8px_rgb(0_0_0/0.75)]" : ""}`}
          aria-label="الرئيسية"
        >
          <img
            src={logosg}
            alt=""
            width={48}
            height={48}
            decoding="async"
            className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-bold tracking-tight text-teal-300 sm:text-base">
              Smart Guide
            </span>
            <span className="text-xs font-bold text-egypt-gold sm:text-sm">
              Egypt
            </span>
          </span>
        </Link>

        <ul
          className={`hidden min-w-0 flex-1 items-center justify-center gap-0.5 px-2 text-sm font-semibold text-white md:flex lg:gap-1 lg:px-4 ${linkShadow}`}
        >
          {navLinks.map((item) => {
            const active = navItemActive(item.href, activeHash);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`relative px-2 pb-2.5 pt-1 transition lg:px-3 ${
                    active
                      ? `${NAV_ORANGE} drop-shadow-sm`
                      : "text-white hover:text-white/90"
                  }`}
                >
                  <span>{item.label}</span>
                  {active ? (
                    <span
                      className={`absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-b-[7px] border-x-transparent ${NAV_ORANGE_BORDER}`}
                      aria-hidden
                    />
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span
            className="hidden h-6 w-px bg-white/40 md:block"
            aria-hidden
          />
          <Link
            to="/login"
            className={`hidden whitespace-nowrap text-sm font-semibold text-white transition hover:text-white/85 md:inline ${linkShadow}`}
          >
            تسجيل الدخول
          </Link>
          <Link
            to="/login"
            className="rounded-md px-2 py-1.5 text-xs font-bold text-white ring-1 ring-white/35 md:hidden"
          >
            دخول
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 text-white transition hover:bg-white/10 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen ? (
          <div
            className={`absolute inset-x-0 top-full border-b px-4 py-4 shadow-xl backdrop-blur-lg md:hidden ${
              overHero
                ? "border-white/15 bg-black/75"
                : "border-white/10 bg-black/90"
            }`}
          >
            <ul className="flex flex-col gap-0.5 text-sm font-semibold">
              {navLinks.map((item) => {
                const active = navItemActive(item.href, activeHash);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`block rounded-lg px-3 py-2.5 transition ${
                        active
                          ? `${NAV_ORANGE} bg-white/5`
                          : "text-white hover:bg-white/10"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 border-t border-white/15 pt-3">
              <Link
                to="/login"
                className="block rounded-lg py-2.5 text-center text-sm font-semibold text-white ring-1 ring-white/30"
                onClick={() => setMenuOpen(false)}
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
