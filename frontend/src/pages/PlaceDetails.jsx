import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getPlaceById } from "../Services/api/placeService";

import {
  getSavedPlaces,
  savePlace,
  deleteSavedPlace,
} from "../Services/api/savedPlaceService";

import {
  getPlaceImage,
  getPlaceTitle,
} from "../Services/utils/placeUtils";

import { getToken, isGuide } from "../Services/utils/tokenUtils";

export default function PlaceDetails() {
  const { id } = useParams();

  const [place, setPlace] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAuthenticated = !!getToken();

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

      setPlace(data?.data ?? data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSavedStatus = async () => {
    try {
      const data = await getSavedPlaces();

      const savedItems =
        data?.data ?? data ?? [];

      setIsSaved(
        savedItems.some(
          (item) =>
            String(item.placeId) ===
            String(id)
        )
      );
    } catch (error) {
      console.error(
        "Failed to fetch saved status:",
        error
      );
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
      console.error(
        "Failed to update saved place:",
        error
      );
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-[#0f172a] text-white">
      <img
        src={getPlaceImage(place)}
        alt={getPlaceTitle(place)}
        className="w-full h-[500px] object-cover"
      />

      <div className="max-w-6xl mx-auto p-10 space-y-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-3">
              {place.name}
            </h1>

            <div className="flex flex-wrap gap-3 text-gray-300">
              <span>
                📍 {place.city}
              </span>

              <span>
                ⭐ {place.rating}
              </span>

              <span>
                🏛 {place.type}
              </span>
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
                className="rounded-2xl border border-white/20 px-6 py-3 text-white hover:border-white transition text-center"
              >
                View Saved Places
              </Link>
            </div>
          )}
        </div>

        <div className="bg-[#1e293b] p-8 rounded-3xl">
          <h2 className="text-3xl font-semibold mb-5">
            Description
          </h2>

          <p className="text-gray-300 leading-8 text-lg">
            {place.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-[#1e293b] p-8 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-6">
              Place Information
            </h2>

            <div className="space-y-4 text-gray-300">
              <p>
                <span className="text-white font-medium">
                  Name:
                </span>{" "}
                {place.name}
              </p>

              <p>
                <span className="text-white font-medium">
                  Type:
                </span>{" "}
                {place.type}
              </p>

              <p>
                <span className="text-white font-medium">
                  City:
                </span>{" "}
                {place.city}
              </p>

              <p>
                <span className="text-white font-medium">
                  Governorate:
                </span>{" "}
                {place.governorate}
              </p>

              <p>
                <span className="text-white font-medium">
                  Location:
                </span>{" "}
                {place.location}
              </p>

              <p>
                <span className="text-white font-medium">
                  Period:
                </span>{" "}
                {place.period}
              </p>

              <p>
                <span className="text-white font-medium">
                  Start Year:
                </span>{" "}
                {place.startYear}
              </p>

              <p>
                <span className="text-white font-medium">
                  Created By:
                </span>{" "}
                {place.createdBy}
              </p>

              <p>
                <span className="text-white font-medium">
                  Rating:
                </span>{" "}
                ⭐ {place.rating}
              </p>
            </div>
          </div>

          <div className="bg-[#1e293b] p-8 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-6">
              Historical Background
            </h2>

            <p className="text-gray-300 leading-8">
              {place.historicalBackground}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}