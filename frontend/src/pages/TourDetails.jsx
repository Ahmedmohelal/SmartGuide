import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPinned,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import { getTourById } from "../Services/api/tours";
import { extractTourProgramSections } from "../Services/utils/tourJsonUtils";
import {
  extractTourImageUrls,
  extractTourMaxGroupSize,
} from "../Services/utils/tourUtils";

const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const thumbnailsRef = useRef(null);

  const FALLBACK_HERO =
    "https://images.unsplash.com/photo-1539768942893-daf53e449371?auto=format&fit=crop&w=1600&q=80";

  useEffect(() => {
    if (!id) {
      setError("Invalid tour ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getTourById(id);

        if (!cancelled) {
          setTour(data);
          setActiveImageIdx(0);
        }
      } catch {
        if (!cancelled) setError("Failed to load tour details.");
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
    return extractTourImageUrls(tour);
  }, [tour]);

  const { stops, inclusions, addOns } = useMemo(
    () => extractTourProgramSections(tour),
    [tour],
  );

  const hero =
    images.length > 0
      ? images[Math.min(activeImageIdx, images.length - 1)]
      : FALLBACK_HERO;

  const galleryImages = images.length > 0 ? images : [FALLBACK_HERO];
  const hasGallery = galleryImages.length > 1;

  const scrollThumbnails = (direction) => {
    thumbnailsRef.current?.scrollBy({
      left: direction === "next" ? 150 : -150,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const title = pick(tour.title, tour.Title);
  const description =
    pick(tour.description, tour.Description) || "No description available.";

  const durationHours = pick(tour.durationHours, tour.DurationHours);
  const price = pick(tour.price, tour.Price);
  const maxGroupSize = extractTourMaxGroupSize(tour);

  return (
    <>
      {/* 🔥 FIXED BACKGROUND LAYER */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0a7462] via-white to-[#e7f0ff]" />

      <div className="min-h-screen pt-24 pb-20">
        <article className="mx-auto m-20 max-w-7xl px-4 lg:px-8 space-y-10">
          {/* BACK BUTTON */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur px-5 py-2 shadow hover:scale-105 transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>

          {/* HERO */}
          <header className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-[32px] overflow-hidden shadow-2xl">
              <img
                src={hero}
                className="w-full h-full object-cover"
                alt={title}
              />
            </div>

            <div className="rounded-[32px] bg-white/50 backdrop-blur-xl p-8 shadow-xl">
              <h1 className="text-4xl font-extrabold text-slate-900">
                {title}
              </h1>

              <div className="mt-5 max-h-44 overflow-y-auto rounded-2xl border border-white/60 bg-white/45 p-4 pr-3 text-slate-700 shadow-inner tour-description-box">
                <p className="whitespace-pre-wrap break-words leading-7">
                  {description}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {durationHours && (
                  <span className="px-4 py-2 bg-white/40 rounded-full">
                    <Clock className="inline text-egypt-teal" /> {durationHours}{" "}
                    hrs
                  </span>
                )}

                <span className="px-4 py-2 bg-white/40 rounded-full">
                  <Users className="inline text-egypt-teal" /> Up to{" "}
                  {maxGroupSize} guests
                </span>

                {price && (
                  <span className="px-4 py-2 bg-egypt-teal text-white rounded-full">
                    <Banknote className="inline" /> {price} EGP
                  </span>
                )}
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-egypt-teal">
                    Tour Gallery
                  </p>

                  {hasGallery ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => scrollThumbnails("prev")}
                        className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-slate-700 shadow-sm transition hover:bg-white hover:text-egypt-teal"
                        aria-label="Previous tour photos"
                      >
                        <ChevronLeft size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollThumbnails("next")}
                        className="grid h-8 w-8 place-items-center rounded-full bg-egypt-teal text-white shadow-sm transition hover:bg-egypt-teal-dark"
                        aria-label="Next tour photos"
                      >
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <div
                  ref={thumbnailsRef}
                  className="tour-thumbnails flex gap-3 overflow-x-auto pb-2"
                >
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIdx(index)}
                      className={`h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition ${
                        index === activeImageIdx
                          ? "border-egypt-teal ring-4 ring-egypt-teal/15"
                          : "border-white/70 opacity-80 hover:opacity-100"
                      }`}
                      aria-label={`Show tour photo ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${title} photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* Program · Included · Add-ons (from StopsJson / InclusionsJson / AddOnsJson) */}
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="flex flex-col rounded-3xl border border-white/60 bg-white/55 p-7 shadow-lg backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <MapPinned className="shrink-0 text-egypt-teal" size={22} />
                Program
              </h2>
              <div className="mt-6 flex-1 space-y-5">
                {stops.length === 0 ? (
                  <p className="text-sm leading-relaxed text-slate-500">
                    No program stops listed for this tour yet.
                  </p>
                ) : (
                  stops.map((s, i) => (
                    <div key={`${s.title}-${i}`} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-egypt-teal text-sm font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {s.title}
                        </p>
                        {s.description ? (
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {s.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="flex flex-col rounded-3xl border border-white/60 bg-white/55 p-7 shadow-lg backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Package className="shrink-0 text-egypt-teal" size={22} />
                Included
              </h2>
              <div className="mt-6 flex-1 space-y-3">
                {inclusions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nothing listed as included yet.
                  </p>
                ) : (
                  inclusions.map((line, i) => (
                    <div
                      key={`${line}-${i}`}
                      className="rounded-xl border border-slate-100/80 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm"
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="flex flex-col rounded-3xl border border-white/60 bg-white/55 p-7 shadow-lg backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Sparkles className="shrink-0 text-egypt-teal" size={22} />
                Add-ons
              </h2>
              <div className="mt-6 flex-1 space-y-3">
                {addOns.length === 0 ? (
                  <p className="text-sm text-slate-500">No optional add-ons.</p>
                ) : (
                  addOns.map((a, i) => (
                    <div
                      key={`${a.title}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100/80 bg-white/70 px-4 py-3 shadow-sm"
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {a.title}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-egypt-teal">
                        +{a.price} EGP
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
