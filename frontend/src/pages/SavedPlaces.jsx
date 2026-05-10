import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getSavedPlaces,
  deleteSavedPlace,
} from "../Services/api/savedPlaceService";

import {
  getPlaceImage,
  getPlaceRating,
  getPlaceTitle,
  getPlaceDescription,
  getPlaceCity,
} from "../Services/utils/placeUtils";

export default function SavedPlaces() {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const loadSavedPlaces = async () => {
      try {
        const data = await getSavedPlaces();

        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        setSavedPlaces(items);
      } catch (err) {
        console.error(
          "Failed to fetch saved places:",
          err
        );

        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadSavedPlaces();
  }, []);

  const handleRemove = async (placeId) => {
    setDeleting(placeId);

    try {
      await deleteSavedPlace(placeId);

      setSavedPlaces((prev) =>
        prev.filter(
          (place) =>
            place.placeId !== placeId
        )
      );
    } catch (err) {
      console.error(
        "Failed to remove saved place:",
        err
      );
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white text-xl">
        Loading saved places...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-10 text-white">
        <h1 className="text-3xl font-bold mb-4">
          Cannot load saved places
        </h1>

        <p className="text-gray-300">
          Please make sure you are logged in
          and try again.
        </p>
      </div>
    );
  }

  if (!savedPlaces.length) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-4xl font-bold mb-4">
          No saved places yet
        </h1>

        <p className="text-gray-300 text-center">
          Save a place from its details page
          to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-10 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">
          Saved Places
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedPlaces.map((place) => (
            <div
              key={place.placeId}
              className="bg-[#1e293b] rounded-3xl overflow-hidden shadow-lg hover:scale-[1.02] transition duration-300"
            >
              <Link to={`/places/${place.placeId}`}>
                <img
                  src={getPlaceImage(place)}
                  alt={getPlaceTitle(place)}
                  className="w-full h-56 object-cover"
                />
              </Link>

              <div className="p-5 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 line-clamp-1">
                    {getPlaceTitle(place)}
                  </h2>

                  <p className="text-gray-300 text-sm line-clamp-3">
                    {getPlaceDescription(place)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>
                    {getPlaceCity(place)}
                  </span>

                  <span>
                    ⭐ {getPlaceRating(place)}
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleRemove(place.placeId)
                  }
                  disabled={
                    deleting === place.placeId
                  }
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-white hover:bg-red-500 disabled:opacity-60 transition"
                >
                  {deleting === place.placeId
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}