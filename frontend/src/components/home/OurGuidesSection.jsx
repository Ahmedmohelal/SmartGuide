import { useState, useEffect } from "react";
import { getAllGuides } from "../../Services/api/guideService";
import { saveGuide, deleteSavedGuide, getSavedGuides } from "../../Services/api/savedGuideService";
import { isGuide, getToken } from "../../Services/utils/tokenUtils";
import { Link } from "react-router-dom";

const getGuideName = (guide) => {
  if (guide.firstName && guide.lastName) {
    return `${guide.firstName} ${guide.lastName}`;
  }
  if (guide.FirstName && guide.LastName) {
    return `${guide.FirstName} ${guide.LastName}`;
  }
  return guide.name || guide.Name || guide.userName || guide.UserName || "Unknown Guide";
};

const getGuideImage = (guide) => {
  return (
    guide.profilePicture ||
    guide.ProfilePicture ||
    guide.image ||
    guide.Image ||
    "/default-avatar.png"
  );
};

const getGuideRating = (guide) => {
  return guide.rating || guide.averageRating || guide.AverageRating || "N/A";
};

const getGuideCity = (guide) => {
  return guide.city || guide.City || guide.location || guide.Location || "Egypt";
};

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
          const savedItems = Array.isArray(savedData) ? savedData : [];
          setSavedGuides(savedItems);
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
            (guide) =>
              String(guide.guideId ?? guide.id) !== String(guideId)
          )
        );
      } else {
        await saveGuide(guideId);
        const guide = guides.find(
          (g) => String(guideRowId(g)) === String(guideId)
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
        method: error.config?.method
      });
      
      if (error.response?.status === 404) {
        alert("Saved guides endpoint not found. The feature will be available soon!");
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-egypt-teal"></div>
            <p className="mt-4 text-slate-600">Loading guides...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="guides" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Our Guides
        </h2>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-egypt-teal" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide) => {
            const gid = guideRowId(guide);
            return (
              <article
                key={gid != null ? String(gid) : getGuideName(guide)}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm transition hover:shadow-md"
              >
                {isAuthenticated && !isUserGuide && gid != null && isGuideSaved(gid) && (
                  <div className="absolute top-3 right-3 z-10 rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                    SAVED
                  </div>
                )}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getGuideImage(guide)}
                    alt={getGuideName(guide)}
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold leading-snug text-slate-900">
                    {getGuideName(guide)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {guide.bio || `Professional tour guide from ${getGuideCity(guide)}`}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                    <span>📍 {getGuideCity(guide)}</span>
                    <span>⭐ {getGuideRating(guide)}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={gid != null ? `/guides/${gid}` : "#"}
                      className="flex-1 rounded-lg border border-egypt-teal py-2 text-center text-sm font-bold text-egypt-teal transition hover:underline"
                    >
                      View Profile
                    </Link>
                    {isAuthenticated && !isUserGuide && gid != null && (
                      <button
                        type="button"
                        onClick={() => handleToggleSave(gid)}
                        disabled={saving === gid}
                        className={`rounded-lg px-3 py-2 text-sm font-bold transition disabled:opacity-60 ${
                          isGuideSaved(gid)
                            ? "bg-red-600 text-white hover:bg-red-500"
                            : "bg-egypt-teal text-white hover:bg-egypt-teal/90"
                        }`}
                      >
                        {saving === gid
                          ? "Saving..."
                          : isGuideSaved(gid)
                            ? "Remove"
                            : "Save"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {guides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No guides available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
