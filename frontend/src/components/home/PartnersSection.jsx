import { partners } from "../../data/homeContent";

export default function PartnersSection() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-egypt-teal px-6 py-10 shadow-xl sm:px-10">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.map((name) => (
            <span
              key={name}
              className="text-sm font-bold tracking-wide text-white/95 sm:text-base"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
