import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToursCatalog, getMyTours } from "../Services/api/tours";
import {
  extractTourDescription,
  extractTourImageUrl,
  extractTourMaxGroupSize,
} from "../Services/utils/tourUtils";

export default function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("userRole") || "").toLowerCase();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setTours([]);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const isGuide = role === "tourguide";
        const data = isGuide ? await getMyTours() : await getToursCatalog();
        if (!cancelled) setTours(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setTours([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, role]);

  if (!token) {
    return (
      <div
        dir="rtl"
        lang="ar"
        className="mx-auto max-w-lg px-4 py-20 text-center text-slate-700"
      >
        <p className="font-medium">يجب تسجيل الدخول لعرض الرحلات.</p>
        <Link
          to="/login"
          className="mt-4 inline-block rounded-xl bg-egypt-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        dir="rtl"
        lang="ar"
        className="py-20 text-center text-slate-600"
      >
        جاري التحميل…
      </div>
    );
  }

  const fallbackImg =
    "https://images.unsplash.com/photo-1539768942893-daf53e449371?auto=format&fit=crop&w=900&q=80";

  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-3xl font-extrabold text-slate-900 sm:text-4xl">
          الرحلات
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          تصفّح الرحلات وافتح أي بطاقة للتفاصيل.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => {
            const tid = tour?.id ?? tour?.Id;
            const title = tour?.title ?? tour?.Title ?? "رحلة";
            const img = extractTourImageUrl(tour) || fallbackImg;
            const excerpt =
              extractTourDescription(tour)?.slice(0, 100) ||
              "اكتشف التفاصيل من صفحة الرحلة.";
            return (
              <article
                key={tid ?? title}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition hover:border-egypt-teal/30 hover:shadow-lg"
              >
                <Link to={tid ? `/tours/${tid}` : "#"} className="block">
                  <img
                    src={img}
                    alt=""
                    className="h-44 w-full object-cover"
                  />
                  <div className="space-y-2 p-5">
                    <h2 className="line-clamp-2 font-bold text-slate-900">
                      {title}
                    </h2>
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {excerpt}
                      {extractTourDescription(tour)?.length > 100 ? "…" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-600">
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-900">
                        {tour?.price ?? tour?.Price ?? "—"} جنيه
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                        {tour?.durationHours ?? tour?.DurationHours ?? "—"} س
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                        حتى {extractTourMaxGroupSize(tour) || "—"} ضيف
                      </span>
                    </div>
                    <span className="inline-block pt-2 text-sm font-semibold text-egypt-teal">
                      عرض التفاصيل ←
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {tours.length === 0 ? (
          <p className="mt-12 text-center text-sm text-slate-500">
            لا توجد رحلات متاحة حالياً.
          </p>
        ) : null}
      </div>
    </div>
  );
}
