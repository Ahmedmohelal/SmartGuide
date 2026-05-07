import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  Clock,
  ImageIcon,
  MapPinned,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import { getTourById } from "../Services/tourService";

const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

export default function TourDetails() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const FALLBACK_HERO =
    "https://images.unsplash.com/photo-1539768942893-daf53e449371?auto=format&fit=crop&w=1600&q=80";

  useEffect(() => {
    if (!id) {
      setError("معرّف الرحلة غير صالح.");
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTourById(id);
        if (!cancelled) {
          setTour(data);
          setActiveImageIdx(0);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (!cancelled) {
          if (status === 401)
            setError("يجب تسجيل الدخول لعرض تفاصيل هذه الرحلة.");
          else if (status === 404) setError("لم يتم العثور على هذه الرحلة.");
          else setError("تعذّر تحميل بيانات الرحلة.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = useMemo(() => {
    if (!tour) return [];
    const list = Array.isArray(tour.images)
      ? tour.images
      : Array.isArray(tour.Images)
        ? tour.Images
        : [];
    return list.filter(Boolean);
  }, [tour]);

  if (loading) {
    return (
      <div
        dir="rtl"
        lang="ar"
        className="min-h-[60vh] bg-white px-4 py-16 text-center text-slate-600"
      >
        جاري تحميل الرحلة…
      </div>
    );
  }

  if (error || !tour) {
    const is401 =
      typeof error === "string" && error.includes("تسجيل الدخول");

    return (
      <div
        dir="rtl"
        lang="ar"
        className="mx-auto max-w-lg px-4 py-16 text-center"
      >
        <p className="text-red-600 font-medium">{error || "لا توجد بيانات."}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {is401 ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-egypt-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              تسجيل الدخول
            </Link>
          ) : null}
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <ArrowRight size={18} aria-hidden />
            الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const title = pick(tour.title, tour.Title);
  const description =
    pick(tour.description, tour.Description) ||
    "لا يوجد وصف لهذه الرحلة بعد.";
  const durationHours = pick(tour.durationHours, tour.DurationHours);
  const price = pick(tour.price, tour.Price);
  const maxGroupSize = pick(tour.maxGroupSize, tour.MaxGroupSize);

  const stops = Array.isArray(tour.stops)
    ? tour.stops
    : Array.isArray(tour.Stops)
      ? tour.Stops
      : [];

  const inclusions = Array.isArray(tour.inclusions)
    ? tour.inclusions
    : Array.isArray(tour.Inclusions)
      ? tour.Inclusions
      : [];

  const addOns = Array.isArray(tour.addOns)
    ? tour.addOns
    : Array.isArray(tour.AddOns)
      ? tour.AddOns
      : [];

  const safeIdx =
    images.length > 0
      ? Math.min(activeImageIdx, Math.max(0, images.length - 1))
      : 0;

  const hero = images.length > 0 ? images[safeIdx] : FALLBACK_HERO;

  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-slate-50 pb-16 font-sans antialiased"
    >
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-sm font-semibold text-egypt-teal hover:underline"
          >
            <ArrowRight size={18} aria-hidden />
            الرئيسية
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="relative aspect-[21/9] min-h-[200px] w-full sm:aspect-[2.4/1]">
            <img
              src={hero}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 start-0 end-0 p-6 sm:p-8">
              <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-4xl">
                {title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/95">
                {durationHours != null ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                    <Clock size={16} />
                    {durationHours} ساعة
                  </span>
                ) : null}
                {maxGroupSize != null && maxGroupSize !== "" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                    <Users size={16} />
                    حتى {maxGroupSize} ضيف
                  </span>
                ) : null}
                {price != null && price !== "" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-egypt-teal/90 px-3 py-1 font-semibold">
                    <Banknote size={16} />
                    {price} جنيه
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">عن الرحلة</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-600">
                {description}
              </p>
            </section>

            {stops.length > 0 ? (
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <MapPinned className="text-egypt-teal" size={22} />
                  المحطات والبرنامج
                </div>
                <ol className="mt-4 space-y-4">
                  {stops
                    .slice()
                    .sort(
                      (a, b) =>
                        (a.orderIndex ?? a.OrderIndex ?? 0) -
                        (b.orderIndex ?? b.OrderIndex ?? 0)
                    )
                    .map((stop, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 border-s-4 border-egypt-teal ps-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {stop.title ?? stop.Title}
                          </p>
                          {(stop.description ?? stop.Description) ? (
                            <p className="mt-1 text-sm text-slate-600">
                              {stop.description ?? stop.Description}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                </ol>
              </section>
            ) : null}

            {inclusions.length > 0 ? (
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Package className="text-egypt-teal" size={22} />
                  ما يشمله العرض
                </div>
                <ul className="mt-4 space-y-2 text-slate-700">
                  {inclusions.map((inc, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-egypt-teal" aria-hidden>
                        •
                      </span>
                      <span>
                        {inc.description ?? inc.Description}
                        {inc.type || inc.Type ? (
                          <span className="ms-1 text-xs text-slate-500">
                            ({inc.type ?? inc.Type})
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {addOns.length > 0 ? (
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Sparkles className="text-egypt-teal" size={22} />
                  إضافات اختيارية
                </div>
                <ul className="mt-4 divide-y divide-slate-100">
                  {addOns.map((a, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {a.title ?? a.Title}
                      </span>
                      <span className="shrink-0 font-semibold text-egypt-teal">
                        +{a.price ?? a.Price} جنيه
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {images.length > 1 ? (
            <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <ImageIcon size={18} className="text-egypt-teal" />
                معرض الصور
              </div>
              <div className="grid grid-cols-2 gap-2">
                {images.map((src, idx) => (
                  <button
                    type="button"
                    key={`${src}-${idx}`}
                    className={`overflow-hidden rounded-xl border bg-slate-100 ring-offset-2 hover:ring-2 hover:ring-egypt-teal/40 ${
                      idx === safeIdx
                        ? "ring-2 ring-egypt-teal border-egypt-teal"
                        : "border-slate-100"
                    }`}
                    onClick={() => setActiveImageIdx(idx)}
                  >
                    <img
                      src={src}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </article>
    </div>
  );
}
