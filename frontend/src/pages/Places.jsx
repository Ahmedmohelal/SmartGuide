import { useEffect, useState } from "react";
import { getAllPlaces } from "../Services/api/placeService";
import { getSavedPlaces } from "../Services/api/savedPlaceService";
import { Link } from "react-router-dom";
import { getPlaceImage, getPlaceRating } from "../Services/utils/placeUtils";
import { isGuide } from "../Services/utils/tokenUtils";

const getPlaceTitle = (place) => place.name || place.title || "Untitled Place";

const getPlaceDescription = (place) => place.description || place.desc || "";

const getPlaceCity = (place) => place.city || place.location || "Egypt";

export default function Places() {
  const [places, setPlaces] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPlaceSaved = (placeId) => {
    return savedPlaces.some(savedPlace => savedPlace.placeId === placeId);
  };

  const loadSavedPlaces = async () => {
    try {
      const data = await getSavedPlaces();
      const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setSavedPlaces(items);
    } catch (error) {
      console.error("Failed to load saved places:", error);
      setSavedPlaces([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [placesData] = await Promise.all([
          getAllPlaces({
            pageIndex,
            pageSize,
            search: activeSearch,
          }),
          loadSavedPlaces()
        ]);

        const placeList = placesData?.data ?? placesData?.items ?? [];
        setPlaces(placeList);
        setTotalCount(placesData?.count ?? placeList.length);
      } catch (error) {
        console.error("Failed to load places:", error);
        setPlaces([]);
        setTotalCount(0);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pageIndex, pageSize, activeSearch]);

  if (loading) {
    return (
      <div className="text-white text-center mt-20">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-10 text-white">
        <h1 className="text-3xl font-bold mb-4">Cannot load places</h1>
        <p className="text-gray-300">There was a problem loading places. Please make sure you are logged in and try again.</p>
      </div>
    );
  }

  if (!places.length) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-10 text-white">
        <h1 className="text-3xl font-bold mb-4">لا توجد أماكن</h1>
        <p className="text-gray-300">
          لم تُرجع الخدمة أي نتائج. جرّب كلمة بحث مختلفة أو أعد تحميل الصفحة.
        </p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showingFrom = totalCount > 0 ? (pageIndex - 1) * pageSize + 1 : 0;
  const showingTo = Math.min(totalCount, showingFrom + places.length - 1);

  return (
    <section id="places">
      <div className="min-h-screen bg-[#0f172a] p-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 mx-auto m-20">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Tourist Places</h1>
            <p className="text-gray-400">Showing {showingFrom}-{showingTo} of {totalCount}</p>
          </div>

          <form className="flex items-center gap-2" onSubmit={(e) => {
            e.preventDefault();
            setPageIndex(1);
            setActiveSearch(searchTerm.trim());
          }}>
            <input
              className="rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              type="search"
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-5 py-3 text-white hover:bg-sky-500 transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
        {places.map((place) => (
          <Link
            key={place.id}
            to={`/places/${place.id}`}
            className="bg-[#1e293b] rounded-2xl overflow-hidden hover:scale-105 transition relative"
          >
            {!isGuide() && isPlaceSaved(place.id) && (
              <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                SAVED
              </div>
            )}
            <img
              src={getPlaceImage(place)}
              alt={getPlaceTitle(place)}
              className="w-full h-52 object-cover"
            />

            <div className="p-5">
              <h2 className="text-white text-2xl font-semibold mb-2">
                {getPlaceTitle(place)}
              </h2>

              {getPlaceDescription(place) && (
                <p className="text-gray-300 line-clamp-3">
                  {getPlaceDescription(place)}
                </p>
              )}

              <div className="flex justify-between mt-4 text-sm text-gray-400">
                <span>{getPlaceCity(place) || "Egypt"}</span>
                <span>⭐ {getPlaceRating(place)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
        <p className="text-gray-300">
          Page {pageIndex} of {totalPages}
        </p>
        <div className="flex gap-3">
          <button
            disabled={pageIndex <= 1}
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 1))}
            className="rounded-xl bg-slate-700 px-4 py-3 text-white disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            Previous
          </button>
          <button
            disabled={pageIndex >= totalPages}
            onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))}
            className="rounded-xl bg-slate-700 px-4 py-3 text-white disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            Next
          </button>
        </div>
      </div>
    </div>
    </section>
  );
}