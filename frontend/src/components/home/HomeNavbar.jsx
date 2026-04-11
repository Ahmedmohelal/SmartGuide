import { Link } from "react-router-dom";
import { navLinks } from "../../data/homeContent";

export default function HomeNavbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white/10 text-sm font-bold text-white backdrop-blur-sm"
          aria-label="الرئيسية"
        >
          SG
        </Link>
        <ul className="hidden flex-wrap items-center justify-end gap-1 text-sm font-semibold text-white md:flex">
          {navLinks.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-white/15"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/login"
              className="ms-2 rounded-full bg-white/95 px-4 py-2 text-egypt-teal shadow-sm transition hover:bg-white"
            >
              تسجيل الدخول
            </Link>
          </li>
        </ul>
        <Link
          to="/login"
          className="rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-egypt-teal md:hidden"
        >
          دخول
        </Link>
      </nav>
    </header>
  );
}
