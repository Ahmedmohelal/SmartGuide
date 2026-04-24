import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link as RouterLink } from "react-router-dom"; // للينكات اللي بتروح صفحات تانية
import { Link as ScrollLink } from "react-scroll"; // للسكرول الناعم في نفس الصفحة
import { footer } from "../data/homeContent";

export default function HomeFooter() {
  return (
    <footer
      id="footer"
      className="bg-footer-navy px-4 py-14 text-white sm:px-6 lg:px-8"
      dir="rtl" // ضفتلك rtl عشان العربي يظبط لو فيه نصوص
    >
      <div className="mx-auto max-w-4xl text-center">
        
        {/* اللوجو (بيرجعنا للصفحة الرئيسية فوق خالص) */}
        <RouterLink
          to="/home"
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold"
        >
          <img src="/logo.png" alt="Smart Guide Logo" 
          className="h-26 w-auto object-contain transition-all duration-300"
          />
        </RouterLink>
        <p className="mt-4 text-lg font-bold">{footer.brand}</p>
        
        {/* اللينكات */}
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          
          {/* 1. لينكات الداتا (السكرول الناعم) */}
          {footer.links.map((l) => {
            // بنشيل علامة الـ # عشان المكتبة تاخد الـ id صافي
            const targetId = l.href.replace("#", "");
            
            return (
              <ScrollLink
                key={l.label}
                to={targetId}
                spy={true}
                smooth={true}
                offset={-100}
                duration={500}
                className="text-white/85 transition hover:text-white cursor-pointer"
              >
                {l.label}
              </ScrollLink>
            );
          })}

          {/* 2. لينكات الصفحات الخارجية */}
          <RouterLink
            to="/login"
            className="text-white/85 transition hover:text-white"
          >
            تسجيل الدخول
          </RouterLink>
          <RouterLink
            to="/register"
            className="text-white/85 transition hover:text-white"
          >
            إنشاء حساب
          </RouterLink>
        </nav>
        
        {/* أيقونات السوشيال ميديا */}
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