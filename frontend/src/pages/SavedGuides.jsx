import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getSavedGuides,
  deleteSavedGuide,
} from "../Services/api/savedGuideService";

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

const savedRowId = (guide) => guide?.guideId ?? guide?.GuideId ?? guide?.id ?? guide?.Id;

export default function SavedGuides() {
  const [savedGuides, setSavedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const loadSavedGuides = async () => {
      try {
        const data = await getSavedGuides();
        setSavedGuides(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "Failed to fetch saved guides:",
          err
        );

        // Handle 404 error gracefully - the endpoint might not be implemented yet
        if (err.response?.status === 404) {
          setError(new Error("Saved guides feature will be available soon!"));
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSavedGuides();
  }, []);

  const handleRemove = async (guideId) => {
    setDeleting(guideId);

    try {
      await deleteSavedGuide(guideId);

      setSavedGuides((prev) =>
        prev.filter(
          (guide) => String(savedRowId(guide)) !== String(guideId)
        )
      );
    } catch (err) {
      console.error(
        "Failed to remove saved guide:",
        err
      );
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white text-xl">
        Loading saved guides...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-10 text-white">
        <h1 className="text-3xl font-bold mb-4">
          Cannot load saved guides
        </h1>

        <p className="text-gray-300">
          Please make sure you are logged in
          and try again.
        </p>
      </div>
    );
  }

  if (!savedGuides.length) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-4xl font-bold mb-4">
          No saved guides yet
        </h1>

        <p className="text-gray-300 text-center">
          Save a guide from the Our Guides section
          to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-10 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">
          Saved Guides
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedGuides.map((guide) => {
            const rid = savedRowId(guide);
            return (
            <div
              key={rid != null ? String(rid) : getGuideName(guide)}
              className="bg-[#1e293b] rounded-3xl overflow-hidden shadow-lg hover:scale-[1.02] transition duration-300"
            >
              <Link to={rid != null ? `/guides/${rid}` : "#"}>
                <img
                  src={getGuideImage(guide)}
                  alt={getGuideName(guide)}
                  className="w-full h-56 object-cover"
                />
              </Link>

              <div className="p-5 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 line-clamp-1">
                    {getGuideName(guide)}
                  </h2>

                  {guide.bio && (
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {guide.bio}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>
                    {getGuideCity(guide)}
                  </span>

                  <span>
                    ⭐ {getGuideRating(guide)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => rid != null && handleRemove(rid)}
                  disabled={rid == null || deleting === rid}
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-white hover:bg-red-500 disabled:opacity-60 transition"
                >
                  {deleting === rid ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
