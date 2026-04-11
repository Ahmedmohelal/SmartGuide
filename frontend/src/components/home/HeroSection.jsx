import HomeNavbar from "./HomeNavbar";
import { hero } from "../../data/homeContent";

/** مسار موجة عضوي (شبه فرشاة/ورق) — يتناسب مع عرض الشاشة */
function HeroWavePaths() {
  return (
    <>
      {/* طبقة ظل خلف البيض */}
      <path
        fill="currentColor"
        d="M0,72 C120,88 240,48 400,64 C560,80 680,40 880,56 C1080,72 1240,52 1440,68 L1440,140 L0,140 Z"
      />
    </>
  );
}

function HeroWaveMain() {
  return (
    <path
      fill="currentColor"
      d="M0,88 C180,102 320,58 520,78 C720,98 860,62 1040,82 C1220,102 1320,70 1440,86 L1440,160 L0,160 Z"
    />
  );
}

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] w-full overflow-hidden bg-white"
    >
      {/* صورة الهيرو — object-position يظبط القص لو الصورة طويلة أو بورتريه */}
      <div className="absolute inset-0 z-0">
        <img
          src={hero.image}
          alt=""
          width={1920}
          height={1080}
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover object-[center_22%] sm:object-[center_28%] lg:object-center"
        />
      </div>

      <div
        className="absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-black/28 to-black/60"
        aria-hidden
      />

      <div className="home-hero-bottom-fade" aria-hidden />

      <HomeNavbar />

      <div className="relative z-[3] mx-auto flex min-h-[90vh] max-w-4xl flex-col items-center justify-center px-4 pb-36 pt-28 text-center sm:px-6 sm:pb-40">
        <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">
          {hero.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/95 drop-shadow sm:text-lg">
          {hero.subtitle}
        </p>
        <a
          href="#featured"
          className="mt-10 inline-flex rounded-full bg-white px-8 py-3 text-base font-bold text-egypt-teal shadow-lg transition hover:bg-white/95"
        >
          {hero.cta}
        </a>
      </div>

      <div className="home-hero-wave" aria-hidden>
        <div className="home-hero-wave__shadow">
          <svg
            viewBox="0 0 1440 140"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <HeroWavePaths />
          </svg>
        </div>
        <div className="home-hero-wave__main">
          <svg
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <HeroWaveMain />
          </svg>
        </div>
      </div>
    </section>
  );
}
