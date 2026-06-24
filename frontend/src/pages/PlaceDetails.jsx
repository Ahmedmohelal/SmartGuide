import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getPlaceById, ratePlace } from "../Services/api/placeService";

import {
  getSavedPlaces,
  savePlace,
  deleteSavedPlace,
} from "../Services/api/savedPlaceService";

import { getPlaceImage, getPlaceTitle } from "../Services/utils/placeUtils";

import { getToken, isGuide } from "../Services/utils/tokenUtils";
import { useNavigate } from "react-router-dom";

export default function PlaceDetails() {
  const { id } = useParams();

  const [place, setPlace] = useState(null);

  const [isSaved, setIsSaved] = useState(false);

  const [saving, setSaving] = useState(false);

  const [selectedRating, setSelectedRating] = useState(0);

  const [review, setReview] = useState("");

  const [submittingRating, setSubmittingRating] = useState(false);

  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);

  const isAuthenticated = !!getToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const loadPlaceData = async () => {
        await fetchPlace();

        if (isAuthenticated) {
          await fetchSavedStatus();
        }
      };

      loadPlaceData();
    }
  }, [id, isAuthenticated]);

  const fetchPlace = async () => {
    try {
      const data = await getPlaceById(id);

      const placeData = data?.data ?? data;

      setPlace(placeData);

      setSelectedRating(placeData?.myRating ?? 0);
      setHasSubmittedRating(placeData?.myRating !== null);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSavedStatus = async () => {
    try {
      const data = await getSavedPlaces();

      const savedItems = data?.data ?? data ?? [];

      setIsSaved(
        savedItems.some((item) => String(item.placeId) === String(id)),
      );
    } catch (error) {
      console.error("Failed to fetch saved status:", error);
    }
  };

  const handleToggleSaved = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (!place) return;

    setSaving(true);

    try {
      if (isSaved) {
        await deleteSavedPlace(place.id);
      } else {
        await savePlace(place.id);
      }

      await fetchSavedStatus();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitRating = async () => {
  if (!isAuthenticated) {
    window.location.href = "/login";
    return;
  }

  if (!selectedRating) return;

  try {
    setSubmittingRating(true);

    await ratePlace(place.id, selectedRating, review);

    // refresh details page data
    await fetchPlace();

    setReview("");
    setHasSubmittedRating(true);

    // 🔥 مهم: نرجّع Places مع تحديث
    navigate("/places", {
      state: {
        refresh: true,
        updatedPlace: {
          id: place.id,
          rating: place?.rating ?? place?.averageRating ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("Failed to submit rating:", error);
  } finally {
    setSubmittingRating(false);
  }
};

  if (!place) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen from-[#0a7462] via-white to-[#e7f0ff] text-[#004D40]">
      <img
        src={getPlaceImage(place)}
        alt={getPlaceTitle(place)}
        className="w-full h-[500px] object-cover"
      />

      <div className="max-w-6xl mx-auto p-10 space-y-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-3">{place.name}</h1>

            <div className="flex flex-wrap gap-3 text-gray-500">
              <span>📍 {place.city}</span>

              <span>⭐ {(place.averageRating ?? 0).toFixed(1)}</span>

              <span>({place.ratingsCount ?? 0} ratings)</span>

              <span>🏛 {place.type}</span>
            </div>
          </div>

          {!isGuide() && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleToggleSaved}
                disabled={saving}
                className="rounded-2xl bg-sky-600 px-6 py-3 text-white hover:bg-sky-500 transition disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : isSaved
                    ? "Remove from Saved"
                    : "Save Place"}
              </button>

              <Link
                to="/saved-places"
                className="rounded-2xl border border-sky-600 px-6 py-3 text-sky-600 text-center"
              >
                View Saved Places
              </Link>
            </div>
          )}
        </div>

        <div className="bg-[#004D40] p-8 rounded-3xl">
          <h2 className="text-3xl text-white font-semibold mb-5">
            Description
          </h2>

          <p className="text-gray-400 leading-8 text-lg">{place.description}</p>
        </div>

        <div className="bg-[#004D40] p-8 rounded-3xl">
          <h2 className="text-3xl text-white font-semibold mb-6">
            Rate This Place
          </h2>

          <div className="flex gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRating(star)}
                className={`text-5xl transition-all duration-300 transform hover:scale-125 active:scale-95 ${
                  star <= selectedRating
                    ? "text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-pulse"
                    : "text-gray-500 hover:text-yellow-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review..."
            className="w-full rounded-xl p-4 bg-[#0f172a] text-white outline-none mb-4"
            rows={4}
          />

          <button
            onClick={handleSubmitRating}
            disabled={submittingRating || !selectedRating}
            className="bg-sky-600 px-6 py-3 rounded-xl text-white hover:bg-sky-500 transition-all duration-300 hover:scale-105 disabled:opacity-60"
          >
            {submittingRating
              ? "Submitting..."
              : hasSubmittedRating
                ? "Update Rating"
                : "Submit Rating"}
          </button>
        </div>

        <div className="bg-[#004D40] p-8 rounded-3xl">
          <h2 className="text-3xl text-white font-semibold mb-6">Reviews</h2>

          {place.reviews?.length > 0 ? (
            <div className="space-y-5">
              {place.reviews.map((item, index) => (
                <div key={index} className="border-b border-gray-700 pb-4">
                  <div className="text-yellow-400 text-xl mb-2">
                    {"★".repeat(item.rating)}
                  </div>

                  <p className="text-gray-300 mb-2">
                    {item.review || "No review text"}
                  </p>

                  <p className="text-gray-500 text-sm">
                    {new Date(item.createdAtUtc).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
