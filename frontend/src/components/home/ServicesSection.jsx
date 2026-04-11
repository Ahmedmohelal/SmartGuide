import { Plane, Hotel, MapPinned, Camera } from "lucide-react";
import { services } from "../../data/homeContent";

const icons = {
  plane: Plane,
  hotel: Hotel,
  map: MapPinned,
  camera: Camera,
};

export default function ServicesSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8">
        {services.map((item) => {
          const Icon = icons[item.icon] ?? Plane;
          return (
            <article
              key={item.title}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/80 p-8 text-center shadow-sm transition hover:border-egypt-teal/20 hover:shadow-md"
            >
              <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-teal-100 text-egypt-teal">
                <Icon className="h-8 w-8" strokeWidth={1.75} />
              </span>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
