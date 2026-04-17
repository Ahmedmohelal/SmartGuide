import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const ProfileContext = createContext();
const BASE_URL = "http://smartguide.runasp.net/api";

const isTouristRole = (role) => role?.toLowerCase() === "tourist";
const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

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

  const normalizedFirstName =
    firstName || (userName ? userName.split(" ")[0] : "");
  const normalizedLastName =
    lastName || (userName && userName.includes(" ") ? userName.split(" ").slice(1).join(" ") : "");

  return {
    ...fallbackUser,
    ...rawUser,
    id: pickFirst(rawUser.id, rawUser.Id, fallbackUser.id),
    userId: pickFirst(rawUser.userId, rawUser.UserId, fallbackUser.userId, fallbackUser.id),
    userName,
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    email: pickFirst(rawUser.email, rawUser.Email, fallbackUser.email),
    country: pickFirst(rawUser.country, rawUser.Country, fallbackUser.country),
    whatsAppNumber: pickFirst(
      rawUser.whatsAppNumber,
      rawUser.whatsappNumber,
      rawUser.WhatsAppNumber,
      fallbackUser.whatsAppNumber
    ),
    touristImage: pickFirst(rawUser.touristImage, rawUser.profileImage, fallbackUser.touristImage, ""),
  };
};

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. دالة جلب بيانات البروفايل (GET)
  const getProfileData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("userRole");

      if (!token || !userId || !role) {
        setLoading(false);
        return;
      }

      const endpoint =
        isTouristRole(role)
          ? `${BASE_URL}/tourists/${userId}/profile`
          : `${BASE_URL}/tour-guides/${userId}/profile`;

      const response = await axios.get(`${endpoint}?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser((prev) => normalizeProfileData(response.data, prev || {}));
      setError(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("فشل في تحميل بيانات الملف الشخصي");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. دالة تحديث بيانات البروفايل (PUT)
  const updateProfileData = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      const storedUserId = localStorage.getItem("userId");
      const profileUserId = user?.userId ?? user?.id ?? storedUserId;

      const payload = {
        id: user?.id ?? profileUserId,
        userId: profileUserId,
        firstName: String(updatedData.firstName ?? user?.firstName ?? "").trim(),
        lastName: String(updatedData.lastName ?? user?.lastName ?? "").trim(),
        userName: user?.userName,
        email: user?.email,
        country: updatedData.country ?? user?.country,
        whatsAppNumber: String(
          updatedData.whatsAppNumber ?? user?.whatsAppNumber ?? ""
        ).trim(),
        touristImage: user?.touristImage || "",
      };

      const endpoint = isTouristRole(role)
        ? `${BASE_URL}/tourists/${profileUserId}/profile`
        : `${BASE_URL}/tour-guides/${profileUserId}/profile`;

      const response = await axios.put(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 204) {
        const serverUser =
          response.data && typeof response.data === "object" ? response.data : {};

        setUser((prev) =>
          normalizeProfileData(
            {
              ...serverUser,
              ...payload,
              firstName: payload.firstName,
              lastName: payload.lastName,
            },
            prev || {}
          )
        );

        return { success: true };
      }

      return { success: false, error: "تعذر حفظ التعديلات، حاولي مرة أخرى" };
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      return { success: false, error: "تأكد من إدخال بيانات صحيحة" };
    }
  };

  const logout = () => {
    localStorage.clear();
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
