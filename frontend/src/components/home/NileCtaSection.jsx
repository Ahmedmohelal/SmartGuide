import { nileCta } from "../../data/homeContent";

export default function NileCtaSection() {
  return (
    <section className="relative min-h-[320px] w-full overflow-hidden sm:min-h-[380px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${nileCta.image})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
      <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[380px]">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          {nileCta.title}
        </h2>
        <p className="mt-4 max-w-xl text-white/90">{nileCta.subtitle}</p>
        <a
          href="#footer"
          className="mt-8 inline-flex rounded-full bg-egypt-teal px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-egypt-teal-dark"
        >
          {nileCta.cta}
        </a>
      </div>
    </section>
  );
}
