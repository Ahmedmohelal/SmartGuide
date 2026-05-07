import { Facebook, Instagram, Twitter } from "lucide-react";
import { experiences } from "../../data/homeContent";

export default function ExperiencesSection() {
  return (
    <section className="bg-slate-100 py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-stretch lg:gap-10 lg:px-8">
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:min-h-0 sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
          {experiences.cards.map((card) => (
            <article
              key={card.title}
              className="relative min-h-[280px] w-[42%] shrink-0 snap-center overflow-hidden rounded-2xl shadow-lg sm:min-h-[360px] sm:w-auto sm:flex-1"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center p-4 text-white">
                <span className="text-xs opacity-80">Destination</span>
                <h3 className="text-center text-sm font-bold sm:text-base">
                  {card.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
        <div className="flex w-full max-w-md flex-col justify-center lg:max-w-sm">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {experiences.title}
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            {experiences.body}
          </p>
          <a
            href="#featured"
            className="mt-8 inline-flex w-fit rounded-full bg-egypt-teal px-8 py-3 text-sm font-bold text-white transition hover:bg-egypt-teal-dark"
          >
            {experiences.cta}
          </a>
          <div className="mt-10 flex gap-3">
            <a
              href="#"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-egypt-teal hover:text-egypt-teal"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-egypt-teal hover:text-egypt-teal"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-egypt-teal hover:text-egypt-teal"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
