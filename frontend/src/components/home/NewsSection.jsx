import { news } from "../../data/homeContent";

export default function NewsSection() {
  return (
    <section id="news" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 sm:text-4xl">
          {news.title}
        </h2>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-egypt-teal" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {news.items.map((item) => (
            <article
              key={item.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover transition hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold leading-snug text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {item.excerpt}
                </p>
                <a
                  href="#"
                  className="mt-4 text-sm font-bold text-egypt-teal hover:underline"
                >
                  اقرأ المزيد
                </a>
                <span className="mt-2 text-xs text-slate-400">{item.date}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
