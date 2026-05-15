import { motion } from "framer-motion";
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
        <motion.img
          src={hero.image}
          alt=""
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
          className="h-full w-full object-cover object-[center_22%] sm:object-[center_28%] lg:object-center"
        />
      </div>

      <div
        className="absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-black/28 to-black/60"
        aria-hidden
      />

      <div className="home-hero-bottom-fade" aria-hidden />

      <div className="relative z-[3] mx-auto flex min-h-[90vh] max-w-4xl flex-col items-center justify-center px-4 pb-36 pt-28 text-center sm:px-6 sm:pb-40">
        <h1
          dir="ltr"
          className="flex flex-wrap justify-center gap-3 text-4xl font-extrabold leading-tight text-white drop-shadow-md sm:text-5xl md:text-6xl"
        >
          {hero.title.split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{
                opacity: 0,
                y: 40,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-6 max-w-2xl text-base text-white/95 sm:text-lg"
        >
          {hero.subtitle}
        </motion.p>
        <motion.a
          href="#featured"
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.05 }}
          className="mt-10 inline-flex rounded-full bg-white px-8 py-3 text-base font-bold text-egypt-teal shadow-lg"
        >
          {hero.cta}
        </motion.a>
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
