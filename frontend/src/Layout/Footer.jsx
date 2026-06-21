import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link as RouterLink } from "react-router-dom"; // للينكات اللي بتروح صفحات تانية
import { Link as ScrollLink } from "react-scroll"; // للسكرول الناعم في نفس الصفحة
import { footer } from "../data/homeContent";
import footerImg from "../assets/images/lastsection.jpg";
import MediaButton from "../components/Buttons/Tooltip";
import Tooltip from "../components/Buttons/Tooltip";

export default function HomeFooter() {
  return (
    <footer
      id="footer"
      dir="ltr"
      className="relative overflow-hidden px-4 py-14 text-white sm:px-6 lg:px-8"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${footerImg})` }}
      />

      {/* Color Overlay */}
      <div className="absolute inset-0 bg-egypt-teal/80" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <RouterLink
          to="/home"
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold"
        >
          <img
            src="/logo.png"
            alt="Smart Guide Logo"
            className="h-26 w-auto object-contain transition-all duration-300"
          />
        </RouterLink>

        <p className="mt-4 text-lg font-bold">{footer.brand}</p>

        <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          {footer.links.map((l) => {
            const targetId = l.href.replace("#", "");

            return (
              <ScrollLink
                key={l.label}
                to={targetId}
                spy={true}
                smooth={true}
                offset={-100}
                duration={500}
                className="cursor-pointer text-white/85 transition hover:text-white"
              >
                {l.label}
              </ScrollLink>
            );
          })}
        </nav>

        <div className="m-15 flex justify-center ">
          

          <Tooltip />

        


        </div>

        <p className="mt-10 text-xs text-white/50">{footer.copyright}</p>
      </div>
    </footer>
  );
}
