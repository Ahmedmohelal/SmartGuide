import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTopRatedPlaces } from "../../Services/api/placeService";
import { getPlaceImage, getPlaceRating, getPlaceTitle, getPlaceCity } from "../../Services/utils/placeUtils";
import { MapPin, Star, ArrowRight } from "lucide-react";

export default function FeaturedPlacesSection() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeaturedPlaces = async () => {
      try {
        const data = await getTopRatedPlaces(5);
        const placesList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        
        // Sort by rating to ensure we get the highest rated
        const sortedPlaces = placesList.sort((a, b) => {
          const ratingA = parseFloat(getPlaceRating(a)) || 0;
          const ratingB = parseFloat(getPlaceRating(b)) || 0;
          return ratingB - ratingA;
        }).slice(0, 5);
        
        setPlaces(sortedPlaces);
      } catch (err) {
        console.error("Failed to load featured places:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedPlaces();
  }, []);

  if (loading) {
    return (
      <section id="featured" className="bg-gradient-to-br from-slate-50 to-egypt-teal/5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-egypt-teal border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading featured destinations...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || places.length === 0) {
    return (
      <section id="featured" className="bg-gradient-to-br from-slate-50 to-egypt-teal/5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-slate-600">Featured destinations will be available soon.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="bg-gradient-to-br from-slate-50 to-egypt-teal/5 py-16 sm:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 to-egypt-teal bg-clip-text text-transparent mb-4">
            Featured Destinations
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover Egypt's most treasured landmarks, handpicked for their historical significance and visitor ratings
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-1 w-12 bg-egypt-teal rounded-full"></div>
            <Star className="w-5 h-5 text-egypt-teal fill-current" />
            <div className="h-1 w-12 bg-egypt-teal rounded-full"></div>
          </div>
        </div>

        {/* Featured Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {places.map((place, index) => (
            <Link
              key={place.id}
              to={`/places/${place.id}`}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
            >
              {/* Ranking Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                  index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  'bg-gradient-to-r from-egypt-teal to-teal-600'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getPlaceImage(place)}
                  alt={getPlaceTitle(place)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-slate-800">{getPlaceRating(place)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-egypt-teal transition-colors">
                  {getPlaceTitle(place)}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{getPlaceCity(place)}</span>
                </div>

                {/* Hover effect */}
                <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-semibold text-egypt-teal">Explore</span>
                  <ArrowRight className="w-4 h-4 text-egypt-teal transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/places"
            className="inline-flex items-center gap-2 bg-egypt-teal text-white px-8 py-3 rounded-full font-semibold hover:bg-egypt-teal/90 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            View All Destinations
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
