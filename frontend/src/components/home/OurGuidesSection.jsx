import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
} from "lucide-react";
import { getAllGuides } from "../../Services/api/guideService";
import {
  deleteSavedGuide,
  getSavedGuides,
  saveGuide,
} from "../../Services/api/savedGuideService";
import { getToken, isGuide } from "../../Services/utils/tokenUtils";
import GuideCarousel from "../GuideCarousel";

const getGuideName = (guide) => {
  if (guide.firstName && guide.lastName) {
    return `${guide.firstName} ${guide.lastName}`;
  }
  if (guide.FirstName && guide.LastName) {
    return `${guide.FirstName} ${guide.LastName}`;
  }
  return (
    guide.name ||
    guide.Name ||
    guide.userName ||
    guide.UserName ||
    "Unknown Guide"
  );
};

const getGuideImage = (guide) =>
  guide.profilePicture ||
  guide.ProfilePicture ||
  guide.image ||
  guide.Image ||
  "/default-avatar.png";

const getGuideRating = (guide) =>
  guide.rating || guide.averageRating || guide.AverageRating || "N/A";

const getGuideCity = (guide) =>
  guide.city || guide.City || guide.location || guide.Location || "Egypt";

const guideRowId = (guide) => {
  if (guide == null) return null;
  if (typeof guide === "string" || typeof guide === "number") {
    return String(guide);
  }
  if (typeof guide !== "object") return null;
  return (
    guide.id ??
    guide.Id ??
    guide.userId ??
    guide.UserId ??
    guide.guideId ??
    guide.GuideId ??
    guide.tourGuideId ??
    guide.TourGuideId ??
    guide.applicationUserId ??
    guide.ApplicationUserId ??
    guide.guid ??
    guide.Guid ??
    guide.tourGuide?.id ??
    guide.tourGuide?.Id ??
    guide.user?.id ??
    guide.user?.Id ??
    guide.User?.id ??
    guide.User?.Id ??
    null
  );
};

export default function OurGuidesSection() {
  const [guides, setGuides] = useState([]);
  const [savedGuides, setSavedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [activeGuide, setActiveGuide] = useState(0);
  const carouselRef = useRef(null);

  const isAuthenticated = !!getToken();
  const isUserGuide = isGuide();

  useEffect(() => {
    const loadData = async () => {
      try {
        const promises = [getAllGuides()];
        if (isAuthenticated && !isUserGuide) {
          promises.push(getSavedGuides());
        }

        const results = await Promise.all(promises);
        const guidesData = results[0];
        const savedData = results[1];

        const guidesList = Array.isArray(guidesData?.data)
          ? guidesData.data
          : Array.isArray(guidesData?.items)
            ? guidesData.items
            : Array.isArray(guidesData?.Items)
              ? guidesData.Items
              : Array.isArray(guidesData?.value)
                ? guidesData.value
                : Array.isArray(guidesData?.Value)
                  ? guidesData.Value
                  : Array.isArray(guidesData)
                    ? guidesData
                    : [];
        setGuides(guidesList);

        if (isAuthenticated && !isUserGuide && savedData) {
          setSavedGuides(Array.isArray(savedData) ? savedData : []);
        }
      } catch (error) {
        console.error("Failed to load guides:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, isUserGuide]);

  const isGuideSaved = (guideId) =>
    savedGuides.some((savedGuide) => {
      const sid = savedGuide.guideId ?? savedGuide.id;
      return sid != null && String(sid) === String(guideId);
    });

  const guideDots = useMemo(() => guides.slice(0, 8), [guides]);

  const scrollToGuide = useCallback((index) => {
    const carousel = carouselRef.current;
    const item = carousel?.querySelector("[data-guide-card]");
    if (!carousel || !item) return;

    const target = index * (item.getBoundingClientRect().width + 24);
    carousel.scrollTo({ left: target, behavior: "smooth" });
    setActiveGuide(index);
  }, []);

  const scrollCarousel = useCallback((direction) => {
    const carousel = carouselRef.current;
    const item = carousel?.querySelector("[data-guide-card]");
    if (!carousel || !item) return;

    carousel.scrollBy({
      left:
        direction === "next"
          ? item.getBoundingClientRect().width + 24
          : -item.getBoundingClientRect().width - 24,
      behavior: "smooth",
    });
  }, []);

  const handleCarouselScroll = useCallback(() => {
    const carousel = carouselRef.current;
    const item = carousel?.querySelector("[data-guide-card]");
    if (!carousel || !item) return;

    const step = item.getBoundingClientRect().width + 24;
    const nextIndex = Math.round(carousel.scrollLeft / step);
    setActiveGuide(Math.max(0, Math.min(guides.length - 1, nextIndex)));
  }, [guides.length]);

  const handleToggleSave = async (guideId) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setSaving(guideId);

    try {
      if (isGuideSaved(guideId)) {
        await deleteSavedGuide(guideId);
        setSavedGuides((prev) =>
          prev.filter(
            (guide) => String(guide.guideId ?? guide.id) !== String(guideId),
          ),
        );
      } else {
        await saveGuide(guideId);
        const guide = guides.find(
          (g) => String(guideRowId(g)) === String(guideId),
        );
        if (guide) {
          setSavedGuides((prev) => [
            ...prev,
            { ...guide, guideId: String(guideId), id: String(guideId) },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to toggle save guide:", error);
      console.log("Error details:", {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
      });

      if (error.response?.status === 404) {
        alert(
          "Saved guides endpoint not found. The feature will be available soon!",
        );
      } else {
        alert("Failed to save guide. Please try again later.");
      }
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <section id="guides" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-egypt-teal" />
            <p className="mt-4 text-slate-600">Loading guides...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="guides" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-egypt-gold">
              Expert locals
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Our Guides
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-egypt-teal sm:mx-0" />
          </div>

          {/* {guides.length > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollCarousel("prev")}
                className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-egypt-teal hover:text-egypt-teal"
                aria-label="Previous guide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("next")}
                className="grid h-11 w-11 place-items-center rounded-full bg-egypt-teal text-white shadow-sm transition hover:bg-egypt-teal-dark"
                aria-label="Next guide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )} */}
        </div>

        <GuideCarousel
          guides={guides}
          getGuideName={getGuideName}
          getGuideImage={getGuideImage}
          getGuideCity={getGuideCity}
          getGuideRating={getGuideRating}
          guideRowId={guideRowId}
        />

        {/* {guides.length > 1 && (
          <div className="mt-2 flex justify-center gap-2" dir="ltr">
            {guideDots.map((guide, index) => (
              <button
                key={guideRowId(guide) ?? index}
                type="button"
                onClick={() => scrollToGuide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeGuide === index
                    ? "w-8 bg-egypt-teal"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to guide ${index + 1}`}
              />
            ))}
          </div>
        )} */}

        {guides.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-slate-600">No guides available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
