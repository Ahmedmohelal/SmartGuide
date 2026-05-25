import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CalendarDays,
  Globe2,
  Heart,
  Languages,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";
import { getTouristById } from "../Services/api/touristService";
import { createConversation } from "../Services/api/chatService";
import { getToken, getUserIdFromToken } from "../Services/utils/tokenUtils";

const API_ORIGIN = "https://smartguide.runasp.net";

const touristInterests = [
  "Ancient History",
  "Museums",
  "Local Food",
  "Nile Cruises",
  "Photography",
  "Desert Adventures",
];

const getTouristName = (tourist) => {
  const firstName = tourist?.firstName || tourist?.FirstName || "";
  const lastName = tourist?.lastName || tourist?.LastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    tourist?.name ||
    tourist?.Name ||
    tourist?.userName ||
    tourist?.UserName ||
    "Unknown Tourist"
  );
};

const normalizeImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";
  const cleaned = image.replace(/\\/g, "/").trim();
  if (!cleaned) return "";
  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://") ||
    cleaned.startsWith("data:") ||
    cleaned.startsWith("blob:")
  ) {
    return cleaned;
  }
  return cleaned.startsWith("/") ? `${API_ORIGIN}${cleaned}` : `${API_ORIGIN}/${cleaned}`;
};

const getTouristImage = (tourist, name) =>
  normalizeImageUrl(
    tourist?.touristImage ||
      tourist?.TouristImage ||
      tourist?.touristImageUrl ||
      tourist?.TouristImageUrl ||
      tourist?.profilePicture ||
      tourist?.ProfilePicture ||
      tourist?.imageUrl ||
      tourist?.ImageUrl ||
      tourist?.image ||
      tourist?.Image,
  ) ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`;

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
};

const getTouristBio = (tourist) =>
  tourist?.bio ||
  tourist?.Bio ||
  tourist?.description ||
  tourist?.Description ||
  "This traveler is exploring Egypt with Smart Guide Egypt.";

const getFallbackTouristId = () => {
  try {
    return getUserIdFromToken() || localStorage.getItem("userId") || "";
  } catch {
    return localStorage.getItem("userId") || "";
  }
};

const getValidTouristId = (id) => {
  if (id && id !== ":id") return id;
  return getFallbackTouristId();
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

export default function TouristProfilePublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const touristId = getValidTouristId(id);
  const [tourist, setTourist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const loadTourist = async () => {
      try {
        if (!touristId) {
          setError("Tourist id is missing");
          return;
        }

        setLoading(true);
        const data = await getTouristById(touristId);
        setTourist(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load tourist profile:", err);
        setError("Failed to load tourist profile");
      } finally {
        setLoading(false);
      }
    };

    loadTourist();
  }, [touristId]);

  const handleMessageClick = async () => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    try {
      const currentUserId = getUserIdFromToken();
      if (currentUserId && String(currentUserId) === String(touristId)) {
        toast.error("You cannot message yourself");
        return;
      }
    } catch {
      // If the token cannot be decoded, the API request will handle auth.
    }

    try {
      setStartingChat(true);
      const conversation = await createConversation(touristId);
      const newConversationId = getCreatedConversationId(conversation);
      navigate(newConversationId ? `/chat/${newConversationId}` : "/chat");
    } catch (err) {
      console.error("Failed to start chat:", err);
      toast.error("Couldn't start chat with this tourist");
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-egypt-teal"></div>
          <p className="text-slate-600">Loading tourist profile...</p>
        </div>
      </div>
    );
  }

  if (error || !tourist) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold text-red-600">
            {error || "Tourist not found"}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-egypt-teal px-4 py-2 text-white transition hover:bg-egypt-teal/90"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const touristName = getTouristName(tourist);
  const touristImage = getTouristImage(tourist, touristName);
  const userName = tourist?.userName || tourist?.UserName || tourist?.username || "";
  const country = tourist?.country || tourist?.Country || "Egypt";
  const email = tourist?.email || tourist?.Email || "";
  const phoneNumber = tourist?.phoneNumber || tourist?.PhoneNumber || tourist?.phone || "";
  const whatsAppNumber =
    tourist?.whatsAppNumber || tourist?.WhatsAppNumber || tourist?.WhatsAppContact || "";
  const cities = asArray(tourist?.cities || tourist?.Cities);
  const languages = asArray(tourist?.languages || tourist?.Languages);

  const stats = [
    {
      label: "Travel Style",
      value: "Explorer",
      icon: Globe2,
    },
    {
      label: "Interests",
      value: touristInterests.length,
      icon: Heart,
    },
    {
      label: "Member Type",
      value: "Tourist",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-egypt-teal via-teal-500 to-cyan-400" />

        <div className="px-4 pb-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="-translate-y-12 mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-700 shadow-md transition hover:bg-gray-50 hover:shadow-lg"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="relative shrink-0">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg">
                  <img
                    src={touristImage}
                    alt={touristName}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-2 flex-1">
                <h1 className="mb-1 text-3xl font-bold text-gray-900">
                  {touristName}
                </h1>
                <p className="mb-3 text-gray-600">Smart Guide Egypt Tourist</p>

                {userName && (
                  <p className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} className="text-egypt-teal" />
                    @{userName}
                  </p>
                )}

                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-egypt-teal" />
                    <span>{country}</span>
                  </div>
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-egypt-teal" />
                      <a href={`mailto:${email}`} className="text-egypt-teal hover:underline">
                        {email}
                      </a>
                    </div>
                  )}
                  {phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-egypt-teal" />
                      <span>{phoneNumber}</span>
                    </div>
                  )}
                  {whatsAppNumber && (
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-egypt-teal" />
                      <span>{whatsAppNumber}</span>
                    </div>
                  )}
                </div>

                <p className="mb-6 max-w-3xl leading-relaxed text-gray-600">
                  {getTouristBio(tourist)}
                </p>

                <button
                  type="button"
                  onClick={handleMessageClick}
                  disabled={startingChat}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <MessageCircle size={18} />
                  {startingChat ? "Opening..." : "Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 px-4 py-8 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-egypt-teal">
                  <Icon size={22} />
                </div>
                <p className="text-3xl font-bold text-egypt-teal">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50 px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Interests</h2>
          <div className="flex flex-wrap gap-3">
            {touristInterests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-egypt-teal"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {(languages.length > 0 || cities.length > 0) && (
        <div className="px-4 py-12 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            {languages.length > 0 && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Languages size={20} className="text-egypt-teal" />
                  <h2 className="text-xl font-bold text-gray-900">Languages</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {cities.length > 0 && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays size={20} className="text-egypt-teal" />
                  <h2 className="text-xl font-bold text-gray-900">Places to Explore</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {cities.map((city) => (
                    <span
                      key={city}
                      className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
