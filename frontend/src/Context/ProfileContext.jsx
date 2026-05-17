import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import authService from "../Services/authService";

const ProfileContext = createContext();
const BASE_URL = "https://smartguide.runasp.net/api";
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/i, "");

// ✅ نجيب الـ id من التوكن مباشرة
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));

  if (import.meta.env.DEV) {
    console.log("TOKEN PAYLOAD:", payload);
  }

  return payload.sub;
};

const isTouristRole = (role) => role?.toLowerCase() === "tourist";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  const cleaned = value.replace(/\\/g, "/").trim();
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

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
};

const normalizeProfileData = (rawUser = {}, fallbackUser = {}) => {
  const userName =
    pickFirst(
      rawUser.userName,
      rawUser.username,
      rawUser.UserName,
      fallbackUser.userName,
      fallbackUser.username
    ) || "";

  const firstName =
    pickFirst(
      rawUser.firstName,
      rawUser.firstname,
      rawUser.FirstName,
      fallbackUser.firstName,
      fallbackUser.firstname
    ) || "";

  const lastName =
    pickFirst(
      rawUser.lastName,
      rawUser.lastname,
      rawUser.LastName,
      fallbackUser.lastName,
      fallbackUser.lastname
    ) || "";

  return {
    ...fallbackUser,
    ...rawUser,
    id: pickFirst(rawUser.id, rawUser.Id, fallbackUser.id),
    userId: pickFirst(
      rawUser.userId,
      rawUser.UserId,
      fallbackUser.userId,
      fallbackUser.id
    ),
    userName,
    firstName,
    lastName,
    email: pickFirst(rawUser.email, rawUser.Email, fallbackUser.email),
    phoneNumber: pickFirst(rawUser.phoneNumber, rawUser.PhoneNumber, rawUser.phone, rawUser.Phone, fallbackUser.phoneNumber),
    whatsAppNumber: pickFirst(rawUser.whatsAppNumber, rawUser.WhatsAppNumber, rawUser.WhatsAppContact, fallbackUser.whatsAppNumber),
    country: pickFirst(rawUser.country, rawUser.Country, fallbackUser.country),
    bio: pickFirst(rawUser.bio, rawUser.Bio, fallbackUser.bio),
    cities: pickFirst(rawUser.cities, rawUser.Cities, fallbackUser.cities),
    languages: pickFirst(rawUser.languages, rawUser.Languages, fallbackUser.languages),
    touristImage: normalizeImageUrl(
      pickFirst(
        rawUser.touristImage,
        rawUser.TouristImage,
        rawUser.touristImageUrl,
        rawUser.TouristImageUrl,
        rawUser.imageUrl,
        rawUser.ImageUrl,
        fallbackUser.touristImage,
        fallbackUser.TouristImage
      )
    ),
    profilePicture: normalizeImageUrl(
      pickFirst(
        rawUser.profilePicture,
        rawUser.ProfilePicture,
        rawUser.profilePictureUrl,
        rawUser.ProfilePictureUrl,
        rawUser.imageUrl,
        rawUser.ImageUrl,
        fallbackUser.profilePicture,
        fallbackUser.ProfilePicture
      )
    ),
  };
};

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======================
  // GET PROFILE
  // ======================
  const getProfileData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = getUserIdFromToken(); // 🔥 من التوكن
      const role = localStorage.getItem("userRole");

      if (import.meta.env.DEV) {
        console.log("ROLE:", role);
        console.log("USER ID FROM TOKEN:", userId);
      }

      if (!token || !userId || !role) {
        setLoading(false);
        return;
      }

      const endpoint = isTouristRole(role)
        ? `${BASE_URL}/tourists/${userId}/profile`
        : `${BASE_URL}/tour-guides/${userId}/profile`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser((prev) => normalizeProfileData(response.data, prev || {}));
      setError(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================
  // UPDATE PROFILE
  // ======================
  const updateProfileData = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      const userId = getUserIdFromToken(); // 🔥 من التوكن

      const endpoint = isTouristRole(role)
        ? `${BASE_URL}/tourists/${userId}/profile`
        : `${BASE_URL}/tour-guides/${userId}/profile`;

      const formData = new FormData();

      formData.append("FirstName", updatedData.firstName || "");
      formData.append("LastName", updatedData.lastName || "");
      formData.append("Email", updatedData.email || "");
      formData.append("PhoneNumber", updatedData.phoneNumber || "");
      formData.append("Country", updatedData.country || "");
      formData.append("WhatsAppNumber", updatedData.whatsAppNumber || "");
      formData.append("Bio", updatedData.bio || "");
      formData.append("Cities", updatedData.cities || "");
      formData.append("Languages", updatedData.languages || "");
      
      // Add profile picture if provided
      if (updatedData.profilePicture instanceof File) {
        formData.append(
          isTouristRole(role) ? "TouristImage" : "ProfilePicture",
          updatedData.profilePicture
        );
      }

      const response = await axios.put(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 204) {
        console.log("Profile updated successfully, refreshing data...");
        await getProfileData();
        console.log("Profile data refreshed");
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { success: false };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    getProfileData();
  }, [getProfileData]);

  return (
    <ProfileContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        getProfileData,
        updateProfileData,
        logout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context)
    throw new Error("useProfile must be used within a ProfileProvider");
  return context;
};
