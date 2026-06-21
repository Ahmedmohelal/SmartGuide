import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function GuideCarousel({
  guides = [],
  getGuideName,
  getGuideImage,
  getGuideCity,
  getGuideRating,
  guideRowId,
}) {
  const [current, setCurrent] = useState(0);

  const safeLength = guides.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % safeLength);
  }, [safeLength]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? safeLength - 1 : prev - 1));
  }, [safeLength]);

  const visibleGuides = useMemo(() => {
    if (!safeLength) return [];

    const prevIndex = current === 0 ? safeLength - 1 : current - 1;
    const nextIndex = (current + 1) % safeLength;

    return [guides[prevIndex], guides[current], guides[nextIndex]];
  }, [guides, current, safeLength]);

  if (!safeLength) {
    return (
      <div className="py-16 text-center text-slate-500">
        No guides available.
      </div>
    );
  }

  const renderGuideCard = (guide, index) => {
    if (!guide) return null;

    const isCenter = index === 1;
    const gid = guideRowId(guide);

    return (
      <motion.div
        key={guide.id || gid}
        initial={false}
        animate={{
          opacity: 1,
          scale: isCenter ? 1 : 0.92,
          x: isCenter ? 0 : index === 0 ? -22 : 22,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 22,
          mass: 0.9,
        }}
        className={`
    relative overflow-hidden rounded-3xl bg-white shadow-xl
    ${isCenter ? "w-80 h-96 z-10" : "w-64 h-80 z-0 opacity-80"}
  `}
      >
        <div
          className={isCenter ? "h-48 overflow-hidden" : "h-36 overflow-hidden"}
        >
          <img
            src={getGuideImage(guide)}
            alt={getGuideName(guide)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className={isCenter ? "p-5" : "p-4"}>
          <h3
            className={`${isCenter ? "text-xl" : "text-lg"} font-bold text-slate-900`}
          >
            {getGuideName(guide)}
          </h3>

          <p
            className={`${isCenter ? "mt-2 text-sm" : "mt-1 text-xs"} text-slate-600`}
          >
            Professional tour guide from Egypt
          </p>

          <div
            className={`${isCenter ? "mt-3" : "mt-2"} flex items-center justify-between`}
          >
            <div className="flex items-center gap-1">
              <MapPin
                className={`${isCenter ? "h-4 w-4" : "h-3 w-3"} text-egypt-teal`}
              />
              <span className={isCenter ? "text-sm" : "text-xs"}>
                {getGuideCity(guide)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className={isCenter ? "text-sm" : "text-xs"}>
                {getGuideRating(guide)}
              </span>
            </div>
          </div>

          {isCenter && (
            <Link
              to={`/guides/${gid}`}
              className="mt-4 block rounded-xl bg-egypt-teal py-2.5 text-center text-sm font-bold text-white transition hover:opacity-90"
            >
              View Profile
            </Link>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative mx-auto mt-12 max-w-6xl">
      <div className="relative flex items-center justify-center gap-4 px-16">
        <button
          onClick={prev}
          className="absolute left-0 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-egypt-teal text-white shadow-lg transition hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex items-center justify-center gap-4">
          <AnimatePresence mode="popLayout">
            {visibleGuides.map((guide, index) => renderGuideCard(guide, index))}
          </AnimatePresence>
        </div>

        <button
          onClick={next}
          className="absolute right-0 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-egypt-teal text-white shadow-lg transition hover:scale-110"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {guides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all ${
              current === index ? "w-10 bg-egypt-teal" : "w-2.5 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
