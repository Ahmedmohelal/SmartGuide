import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
} from "lucide-react";
import { getMyTours, getToursCatalog } from "../../Services/api/tours";
import {
  extractTourDescription,
  extractTourImageUrl,
  extractTourMaxGroupSize,
} from "../../Services/utils/tourUtils";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1539768942893-daf53e449371?auto=format&fit=crop&w=900&q=80";

const tourHref = (tour) => {
  const id = tour?.id ?? tour?.Id;
  return id ? `/tours/${id}` : "#";
};

export default function ToursSliderSection() {
  const stripRef = useRef(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const role = (
    typeof localStorage !== "undefined"
      ? localStorage.getItem("userRole") || ""
      : ""
  ).toLowerCase();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const isGuide = role === "tourguide";
        const data = isGuide ? await getMyTours() : await getToursCatalog();

        if (!cancelled) {
          setTours(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load tours.");
          setTours([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, role]);

  const scrollStrip = (direction) => {
    const el = stripRef.current;
    if (!el) return;

    const step = Math.min(el.clientWidth * 0.92, 380) * direction;

    el.scrollBy({
      left: step,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="tours"
      className="border-y border-slate-100 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Guide Tours
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Browse available tours and click any card to view full details.
            </p>
          </div>

          {token && tours.length > 1 ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-egypt-teal hover:text-egypt-teal"
                aria-label="Previous"
              >
                <ChevronRight size={22} />
              </button>

              <button
                type="button"
                onClick={() => scrollStrip(1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-egypt-teal hover:text-egypt-teal"
                aria-label="Next"
              >
                <ChevronLeft size={22} />
              </button>
            </div>
          ) : null}
        </div>

        {!token ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
            <p className="font-medium text-slate-700">
              Sign in to explore available tours and book your next adventure.
            </p>

            <Link
              to="/login"
              className="mt-4 inline-flex rounded-xl bg-egypt-teal px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div className="flex gap-4 overflow-hidden pb-2">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="min-w-[280px] flex-1 animate-pulse rounded-2xl border border-slate-100 bg-slate-100 sm:min-w-[320px]"
              >
                <div className="aspect-[16/11] rounded-t-2xl bg-slate-200" />

                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : tours.length === 0 ? (
          <p className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
            No tours available yet.{" "}
            {role === "tourguide"
              ? "You can create new tours from your dashboard."
              : "Check back soon for more experiences."}
          </p>
        ) : (
          <div className="relative">
            <div
              ref={stripRef}
              role="list"
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tours.map((tour) => {
                const img = extractTourImageUrl(tour) || FALLBACK_IMG;

                const title =
                  tour?.title ?? tour?.Title ?? "Untitled Tour";

                const desc =
                  extractTourDescription(tour) ||
                  "Discover this unique experience designed for travel and culture lovers.";

                const href = tourHref(tour);

                return (
                  <Link
                    role="listitem"
                    key={(tour?.id ?? tour?.Id) ?? title}
                    to={href}
                    className="group min-w-[280px] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition hover:border-egypt-teal/40 hover:shadow-lg sm:min-w-[300px]"
                  >
                    <div className="relative aspect-[16/11] overflow-hidden">
                      <img
                        src={img}
                        alt={title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-90" />

                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="line-clamp-2 text-base font-bold leading-snug text-white drop-shadow">
                          {title}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {desc}
                      </p>

                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 font-medium text-teal-900">
                          <Banknote
                            size={14}
                            className="text-egypt-teal"
                          />
                          {tour?.price ?? tour?.Price ?? "—"} EGP
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-800">
                          <Clock
                            size={14}
                            className="text-egypt-teal"
                          />
                          {tour?.durationHours ??
                            tour?.DurationHours ??
                            "—"}{" "}
                          hrs
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-800">
                          <Users
                            size={14}
                            className="text-egypt-teal"
                          />
                          Up to{" "}
                          {extractTourMaxGroupSize(tour) || "—"}{" "}
                          guests
                        </span>
                      </div>

                      <span className="inline-block text-sm font-semibold text-egypt-teal group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}