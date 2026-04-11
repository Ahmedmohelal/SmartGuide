import { featuredPlaces } from "../../data/homeContent";

export default function FeaturedPlacesSection() {
  const { title, items } = featuredPlaces;
  const topRow = items.filter((i) => i.span === "sm");
  const bottomRow = items.filter((i) => i.span === "lg");

  return (
    <section id="featured" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 sm:text-4xl">
          {title}
        </h2>
        <div
          className="mx-auto mt-4 h-1 w-20 rounded-full bg-egypt-teal"
          aria-hidden
        />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {topRow.map((place) => (
            <figure
              key={place.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md"
            >
              <img
                src={place.image}
                alt={place.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <span className="inline-block rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-egypt-teal">
                  {place.name}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {bottomRow.map((place) => (
            <figure
              key={place.id}
              className="group relative aspect-[16/10] overflow-hidden rounded-2xl shadow-md lg:aspect-[5/3]"
            >
              <img
                src={place.image}
                alt={place.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
                <span className="inline-block rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-egypt-teal">
                  {place.name}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
