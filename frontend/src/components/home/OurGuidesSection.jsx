import { useState, useEffect } from "react";
import { getAllGuides } from "../../Services/api/guideService";
import { saveGuide, deleteSavedGuide, getSavedGuides } from "../../Services/api/savedGuideService";
import { isGuide, getToken } from "../../Services/utils/tokenUtils";
import { Link } from "react-router-dom";

const getGuideName = (guide) => {
  if (guide.firstName && guide.lastName) {
    return `${guide.firstName} ${guide.lastName}`;
  }
  return guide.name || guide.userName || "Unknown Guide";
};

const getGuideImage = (guide) => {
  return guide.profilePicture || guide.image || "/default-avatar.png";
};

const getGuideRating = (guide) => {
  return guide.rating || guide.averageRating || "N/A";
};

const getGuideCity = (guide) => {
  return guide.city || guide.location || "Egypt";
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

        const guidesList = Array.isArray(guidesData?.data) ? guidesData.data : Array.isArray(guidesData) ? guidesData : [];
        setGuides(guidesList);

        if (isAuthenticated && !isUserGuide && savedData) {
          const savedItems = Array.isArray(savedData?.data) ? savedData.data : Array.isArray(savedData) ? savedData : [];
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

  const isGuideSaved = (guideId) => {
    return savedGuides.some(savedGuide => 
      (savedGuide.guideId === guideId || savedGuide.id === guideId)
    );
  };

  const handleToggleSave = async (guideId) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setSaving(guideId);

    try {
      if (isGuideSaved(guideId)) {
        await deleteSavedGuide(guideId);
        setSavedGuides(prev => prev.filter(guide => 
          (guide.guideId !== guideId && guide.id !== guideId)
        ));
      } else {
        await saveGuide(guideId);
        const guide = guides.find(g => g.id === guideId);
        if (guide) {
          setSavedGuides(prev => [...prev, { guideId, ...guide }]);
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
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm transition hover:shadow-md relative"
            >
              {isAuthenticated && !isUserGuide && isGuideSaved(guide.id) && (
                <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
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
                    to={`/guides/${guide.id}`}
                    className="flex-1 text-center text-sm font-bold text-egypt-teal hover:underline border border-egypt-teal rounded-lg py-2 transition"
                  >
                    View Profile
                  </Link>
                  {isAuthenticated && !isUserGuide && (
                    <button
                      onClick={() => handleToggleSave(guide.id)}
                      disabled={saving === guide.id}
                      className={`px-3 py-2 text-sm font-bold rounded-lg transition disabled:opacity-60 ${
                        isGuideSaved(guide.id)
                          ? "bg-red-600 text-white hover:bg-red-500"
                          : "bg-egypt-teal text-white hover:bg-egypt-teal/90"
                      }`}
                    >
                      {saving === guide.id 
                        ? "Saving..." 
                        : isGuideSaved(guide.id) 
                        ? "Remove" 
                        : "Save"
                      }
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
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
