import { Headphones, Users } from "lucide-react";
import { about } from "../../data/homeContent";

const bulletIcons = {
  headphones: Headphones,
  users: Users,
};

export default function AboutSection() {
  return (
    <section id="about" className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="home-scallop-frame relative aspect-[4/5] max-h-[480px] w-full max-w-md justify-self-center lg:max-w-none">
          <img
            src={about.image}
            alt="Qaitbay Citadel - Alexandria"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {about.title}
          </h2>
          <div className="mt-3 h-1 w-16 rounded-full bg-egypt-teal" aria-hidden />
          <p className="mt-6 leading-relaxed text-slate-600">{about.body}</p>
          <ul className="mt-8 space-y-4">
            {about.bullets.map((b) => {
              const Icon = bulletIcons[b.icon] ?? Users;
              return (
                <li key={b.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-egypt-teal">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="pt-1.5 font-semibold text-slate-800">
                    {b.text}
                  </span>
                </li>
              );
            })}
          </ul>
          <a
            href="#news"
            className="mt-10 inline-flex rounded-full bg-egypt-teal px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-egypt-teal-dark"
          >
            {about.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
