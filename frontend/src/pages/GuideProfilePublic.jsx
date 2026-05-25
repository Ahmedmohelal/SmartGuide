import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  Star,
  BookmarkCheck,
  Clock,
  Users,
  DollarSign,
  MessageCircle,
} from "lucide-react";
import { getGuideById } from "../Services/api/guideService";
import { getToursByGuide } from "../Services/api/tours";
import {
  saveGuide,
  deleteSavedGuide,
  getSavedGuides,
} from "../Services/api/savedGuideService";
import { createConversation } from "../Services/api/chatService";
import { getToken, isGuide } from "../Services/utils/tokenUtils";

// Helper functions to handle inconsistent API responses
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
  return guide.rating || guide.averageRating || guide.AverageRating || 0;
};

const getGuideTotalReviews = (guide) => {
  return guide.totalReviews || guide.TotalReviews || guide.reviewCount || 0;
};

const getGuideBio = (guide) => {
  return guide.bio || guide.Bio || guide.description || guide.Description || "";
};

const getGuideLanguages = (guide) => {
  if (Array.isArray(guide.languages)) return guide.languages;
  if (Array.isArray(guide.Languages)) return guide.Languages;
  return [];
};

const getTourId = (tour) => tour?.id || tour?.tourId || tour?.Id;
const getTourTitle = (tour) => tour?.title || tour?.Title || "";
const getTourDescription = (tour) => tour?.description || tour?.Description || "";
const getTourPrice = (tour) => tour?.price || tour?.Price || 0;
const getTourDuration = (tour) => tour?.durationHours || tour?.DurationHours || 0;
const getTourImage = (tour) => {
  const image =
    tour.primaryImage ||
    tour.PrimaryImage ||
    tour.imageUrl ||
    tour.ImageUrl ||
    (Array.isArray(tour.images) && tour.images[0]) ||
    (Array.isArray(tour.Images) && tour.Images[0]);

  if (!image) {
    return "https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=900&q=80";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `https://smartguide.runasp.net${image}`;
};

const getMaxGroupSize = (tour) => {
  if (tour.maxGroupSize) return tour.maxGroupSize;
  if (tour.MaxGroupSize) return tour.MaxGroupSize;
  if (typeof tour.tourExtras === "string") {
    try {
      const extras = JSON.parse(tour.tourExtras);
      return extras.maxGroupSize || extras.MaxGroupSize || 10;
    } catch {
      return 10;
    }
  }
  return 10;
};

const getCreatedConversationId = (conversation) =>
  (typeof conversation === "string" ? conversation : null) ||
  conversation?.id ||
  conversation?.Id ||
  conversation?.conversationId ||
  conversation?.ConversationId ||
  conversation?.data?.id ||
  conversation?.data?.Id ||
  conversation?.data?.conversationId ||
  conversation?.data?.ConversationId;

export default function GuideProfilePublic() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [guide, setGuide] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toursLoading, setToursLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [startingChat, setStartingChat] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedGuides, setSavedGuides] = useState([]);

  const isAuthenticated = !!getToken();
  const isUserGuide = isGuide();

  // Load guide data and tours
  useEffect(() => {
    const loadGuideData = async () => {
      try {
        setLoading(true);
        const guideData = await getGuideById(id);
        setGuide(guideData);
        setError(null);
      } catch (err) {
        console.error("Failed to load guide:", err);
        setError("Failed to load guide profile");
      } finally {
        setLoading(false);
      }
    };

    const loadTours = async () => {
  try {
    setToursLoading(true);

    const toursData = await getToursByGuide(id);

    console.log("TOURS DATA:", toursData);

    setTours(Array.isArray(toursData) ? toursData : []);
  } catch (err) {
    console.error("Failed to load guide tours:", err);
    setTours([]);
  } finally {
    setToursLoading(false);
  }
};

    const loadSavedGuides = async () => {
      if (isAuthenticated && !isUserGuide) {
        try {
          const data = await getSavedGuides();
          const savedList = Array.isArray(data) ? data : [];
          setSavedGuides(savedList);
        } catch (err) {
          console.error("Failed to load saved guides:", err);
        }
      }
    };

    if (id) {
      loadGuideData();
      loadTours();
      loadSavedGuides();
    }
  }, [id, isAuthenticated, isUserGuide]);

  // Check if guide is saved
  useEffect(() => {
    const checkIfSaved = () => {
      const saved = savedGuides.some((savedGuide) => {
        const savedId = savedGuide.guideId ?? savedGuide.id;
        return savedId != null && String(savedId) === String(id);
      });
      setIsSaved(saved);
    };

    checkIfSaved();
  }, [savedGuides, id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (isUserGuide) {
      toast.error("Guides cannot save other guides");
      return;
    }

    setSaving(true);

    try {
      if (isSaved) {
        await deleteSavedGuide(id);
        setSavedGuides((prev) =>
          prev.filter(
            (guide) =>
              String(guide.guideId ?? guide.id) !== String(id)
          )
        );
        setIsSaved(false);
        toast.error("Guide removed from saved");
      } else {
        await saveGuide(id);
        if (guide) {
          setSavedGuides((prev) => [
            ...prev,
            { ...guide, guideId: String(id), id: String(id) },
          ]);
        }
        setIsSaved(true);
        toast.success("Guide saved successfully");
      }
    } catch (error) {
      console.error("Failed to toggle save guide:", error);
      toast.error("Failed to save guide");
    } finally {
      setSaving(false);
    }
  };

  const handleChatClick = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isUserGuide) {
      toast.error("Guides can only message tourists");
      return;
    }

    try {
      setStartingChat(true);
      const conversation = await createConversation(id);
      const newConversationId = getCreatedConversationId(conversation);
      navigate(newConversationId ? `/chat/${newConversationId}` : "/chat");
    } catch (err) {
      console.error("Failed to start chat:", err);
      toast.error("Couldn't start chat with this guide");
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-egypt-teal mb-4"></div>
          <p className="text-slate-600">Loading guide profile...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg mb-4">{error || "Guide not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-egypt-teal text-white rounded-lg hover:bg-egypt-teal/90 transition"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const guideName = getGuideName(guide);
  const guideImage = getGuideImage(guide);
  const guideRating = getGuideRating(guide);
  const guideBio = getGuideBio(guide);
  const guideLanguages = getGuideLanguages(guide);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Gradient Background */}
      <div className="relative">
        {/* Orange to Yellow Gradient Background */}
        <div className="h-48 bg-gradient-to-r from-egypt-teal via-teal-500 to-cyan-400" />
        
        {/* Profile Content */}
        <div className="px-4 lg:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="flex justify-between items-center mb-6 -translate-y-12">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div></div>
            </div>

            {/* Profile Card */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Image */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                  <img
                    src={guideImage}
                    alt={guideName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 mt-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {guideName}
                </h1>
                <p className="text-gray-600 mb-3">Professional Tour Guide</p>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${i < Math.round(guideRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900 ml-2">{guideRating}</span>
                    <span className="text-gray-600">({getGuideTotalReviews(guide)} reviews)</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-egypt-teal" />
                    <span>{guide?.country || "Egypt"}</span>
                  </div>
                  {guide?.email && (
                    <div className="flex items-center gap-2">
                      <span>✉️</span>
                      <a href={`mailto:${guide.email}`} className="text-egypt-teal hover:underline">{guide.email}</a>
                    </div>
                  )}
                  {guide?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <span>📱</span>
                      <span>{guide.phoneNumber}</span>
                    </div>
                  )}
                  {guide?.whatsAppNumber && (
                    <div className="flex items-center gap-2">
                      <span>💬</span>
                      <span>{guide.whatsAppNumber}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {guideBio && (
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {guideBio}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleToggleSave}
                    disabled={saving}
                    className={`px-6 py-2 rounded-full font-semibold transition flex items-center gap-2 ${
                      isSaved
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    <BookmarkCheck size={18} />
                    {isSaved ? "Saved" : "Save this guide"}
                  </button>
                  <button
                    onClick={handleChatClick}
                    disabled={startingChat}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    {startingChat ? "Opening..." : "Message"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 lg:px-8 py-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-egypt-teal">{tours.length}</p>
            <p className="text-gray-600 text-sm">Tours Created</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-egypt-teal">{getGuideTotalReviews(guide)}</p>
            <p className="text-gray-600 text-sm">Total Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-egypt-teal">{guideRating}</p>
            <p className="text-gray-600 text-sm">Average Rating</p>
          </div>
        </div>
      </div>

      {/* Languages Section */}
      {guideLanguages.length > 0 && (
        <div className="px-4 lg:px-8 py-8 border-b border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Languages</h3>
            <div className="flex flex-wrap gap-3">
              {guideLanguages.map((language, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:border-egypt-teal transition"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* My Tours Section */}
      <div className="px-4 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">My Tours</h2>

          {toursLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-egypt-teal"></div>
              <p className="mt-4 text-gray-600">Loading tours...</p>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-gray-50">
              <p className="text-gray-600 text-lg">
                This guide hasn't created any tours yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => {
                const tourId = getTourId(tour);
                return (
                  <article
                    key={tourId}
                    className="group rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/tours/${tourId}`)}
                  >
                    {/* Tour Image */}
                    <div className="aspect-video overflow-hidden bg-gray-200">
                      <img
                        src={getTourImage(tour)}
                        alt={getTourTitle(tour)}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Tour Info */}
                    <div className="p-5">
                      {/* Price Badge */}
                      {/* <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${getTourPrice(tour)}
                      </div> */}

                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {getTourTitle(tour)}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {getTourDescription(tour)}
                      </p>

                      {/* Tour Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {getTourDuration(tour) && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-egypt-teal" />
                            <span>{getTourDuration(tour)} hours</span>
                          </div>
                        )}
                        {getMaxGroupSize(tour) && (
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-egypt-teal" />
                            <span>Up to {getMaxGroupSize(tour)} guests</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
