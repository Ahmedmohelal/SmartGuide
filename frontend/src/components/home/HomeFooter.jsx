import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { footer } from "../../data/homeContent";

export default function HomeFooter() {
  return (
    <footer
      id="footer"
      className="bg-footer-navy px-4 py-14 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl text-center">
        <Link
          to="/"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold"
        >
          SG
        </Link>
        <p className="mt-4 text-lg font-bold">{footer.brand}</p>
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          {footer.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-white/85 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            className="text-white/85 transition hover:text-white"
          >
            تسجيل الدخول
          </Link>
          <Link
            to="/register"
            className="text-white/85 transition hover:text-white"
          >
            إنشاء حساب
          </Link>
        </nav>
        <div className="mt-8 flex justify-center gap-4">
          {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="text-white/70 transition hover:text-white"
              aria-label="social"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <p className="mt-10 text-xs text-white/50">{footer.copyright}</p>
      </div>
    </footer>
  );
}
