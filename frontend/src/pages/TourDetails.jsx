import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Clock,
  ImageIcon,
  MapPinned,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import { getTourById } from "../Services/api/tours";

const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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
    const list = Array.isArray(tour.images)
      ? tour.images
      : Array.isArray(tour.Images)
      ? tour.Images
      : [];
    return list.filter(Boolean);
  }, [tour]);

  const hero =
    images.length > 0
      ? images[Math.min(activeImageIdx, images.length - 1)]
      : FALLBACK_HERO;

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

              <p className="mt-5 text-slate-700">{description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {durationHours && (
                  <span className="px-4 py-2 bg-white/40 rounded-full">
                    <Clock className="inline text-egypt-teal" />{" "}
                    {durationHours} hrs
                  </span>
                )}

                {maxGroupSize && (
                  <span className="px-4 py-2 bg-white/40 rounded-full">
                    <Users className="inline text-egypt-teal" />{" "}
                    {maxGroupSize}
                  </span>
                )}

                {price && (
                  <span className="px-4 py-2 bg-egypt-teal text-white rounded-full">
                    <Banknote className="inline" /> {price} EGP
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* STOPS */}
            {stops.length > 0 && (
              <section className="bg-white/50 backdrop-blur-xl p-7 rounded-3xl shadow">
                <h2 className="text-xl font-bold flex gap-2">
                  <MapPinned className="text-egypt-teal" />
                  Program
                </h2>

                <div className="mt-6 space-y-5">
                  {stops.map((s, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-egypt-teal text-white flex items-center justify-center">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{s.title}</p>
                        <p className="text-sm text-slate-600">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* INCLUSIONS */}
            {inclusions.length > 0 && (
              <section className="bg-white/50 backdrop-blur-xl p-7 rounded-3xl shadow">
                <h2 className="text-xl font-bold flex gap-2">
                  <Package className="text-egypt-teal" />
                  Included
                </h2>

                <div className="mt-5 grid gap-3">
                  {inclusions.map((inc, i) => (
                    <div key={i} className="bg-white/40 p-4 rounded-xl">
                      {inc.description}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ADD ONS */}
            {addOns.length > 0 && (
              <section className="bg-white/50 backdrop-blur-xl p-7 rounded-3xl shadow">
                <h2 className="text-xl font-bold flex gap-2">
                  <Sparkles className="text-egypt-teal" />
                  Add-ons
                </h2>

                <div className="mt-5 space-y-3">
                  {addOns.map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between bg-white/40 p-4 rounded-xl"
                    >
                      <span>{a.title}</span>
                      <span className="text-egypt-teal font-semibold">
                        +{a.price} EGP
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    </>
  );
}