import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TourImageCarousel({
  images = [],
  fallback,
  alt = "",
  className = "",
  imageClassName = "",
  showControls = true,
  showDots = true,
}) {
  const slides = images.length > 0 ? images : fallback ? [fallback] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = slides.length > 1;
  const activeImage = slides[Math.min(activeIndex, slides.length - 1)];

  const move = (event, direction) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  if (!activeImage) {
    return <div className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={activeImage} alt={alt} className={`h-full w-full object-cover ${imageClassName}`} />

      {hasMultiple && showControls ? (
        <>
          <button
            type="button"
            onClick={(event) => move(event, -1)}
            className="absolute left-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-md transition hover:bg-white"
            aria-label="Previous tour image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={(event) => move(event, 1)}
            className="absolute right-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-md transition hover:bg-white"
            aria-label="Next tour image"
          >
            <ChevronRight size={20} />
          </button>
        </>
      ) : null}

      {hasMultiple && showDots ? (
        <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setActiveIndex(index);
              }}
              className={`h-1.5 rounded-full transition ${
                index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"
              }`}
              aria-label={`Show tour image ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
