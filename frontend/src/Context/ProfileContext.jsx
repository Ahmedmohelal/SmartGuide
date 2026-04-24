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

  const normalizedFirstName =
    firstName || (userName ? userName.split(" ")[0] : "");
  const normalizedLastName =
    lastName || (userName && userName.includes(" ") ? userName.split(" ").slice(1).join(" ") : "");

  const bio =
    pickFirst(rawUser.bio, rawUser.Bio, fallbackUser.bio) ?? "";
  const pricePerDay = pickFirst(
    rawUser.pricePerDay,
    rawUser.PricePerDay,
    fallbackUser.pricePerDay
  );
  const cities = asArray(
    pickFirst(rawUser.cities, rawUser.Cities, fallbackUser.cities)
  );
  const languages = asArray(
    pickFirst(rawUser.languages, rawUser.Languages, fallbackUser.languages)
  );
  const gallery = asArray(
    pickFirst(rawUser.gallery, rawUser.Gallery, fallbackUser.gallery)
  );
  const profilePicture = pickFirst(
    rawUser.profilePicture,
    rawUser.ProfilePicture,
    fallbackUser.profilePicture
  );

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
    touristImage: pickFirst(
      rawUser.touristImage,
      rawUser.profileImage,
      fallbackUser.touristImage,
      ""
    ),
    bio,
    pricePerDay: pricePerDay ?? 0,
    cities,
    languages,
    gallery,
    profilePicture: profilePicture ?? "",
  };
};

/** Tour guide PUT expects multipart/form-data with PascalCase keys (Swagger). */
const appendFormStringList = (formData, key, list) => {
  asArray(list).forEach((item) => {
    if (item != null && item !== "") formData.append(key, String(item));
  });
};

const normalizeDigits = (value = "") =>
  String(value)
    .trim()
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/\D/g, "");

const normalizeWhatsAppNumber = (rawValue, fallbackValue = "") => {
  const raw = String(rawValue ?? "").trim();
  const fallback = String(fallbackValue ?? "").trim();

  if (!raw) return fallback;

  // keep international form as-is when user already typed valid +XXXXXXXXXX
  if (/^\+\d{10,15}$/.test(raw)) return raw;

  const digits = normalizeDigits(raw);
  if (!digits) return fallback;

  // Egyptian defaults for local entries (01XXXXXXXXX or 10/11 digits without +20)
  if (digits.startsWith("0") && digits.length === 11) return `+2${digits}`;
  if (digits.startsWith("20") && digits.length >= 11) return `+${digits}`;
  if ((digits.startsWith("10") || digits.startsWith("11") || digits.startsWith("12") || digits.startsWith("15")) && digits.length === 10) {
    return `+20${digits}`;
  }

  // Generic international fallback when length looks valid
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;

  // Invalid short value: keep previous valid value to avoid backend 400
  return fallback;
};

const buildTourGuideProfileFormData = (updatedData, currentUser) => {
  const firstName = String(
    updatedData.firstName ?? currentUser?.firstName ?? ""
  ).trim();
  const lastName = String(
    updatedData.lastName ?? currentUser?.lastName ?? ""
  ).trim();
  const country = String(
    updatedData.country ?? currentUser?.country ?? ""
  ).trim();
  const whatsAppNumber = String(
    updatedData.whatsAppNumber ?? currentUser?.whatsAppNumber ?? ""
  ).trim();
  const normalizedWhatsApp = normalizeWhatsAppNumber(
    whatsAppNumber,
    currentUser?.whatsAppNumber
  );
  const bio = String(updatedData.bio ?? currentUser?.bio ?? "").trim();
  const priceRaw = pickFirst(
    updatedData.pricePerDay,
    currentUser?.pricePerDay,
    0
  );
  const pricePerDay =
    typeof priceRaw === "number" && !Number.isNaN(priceRaw)
      ? priceRaw
      : parseFloat(String(priceRaw)) || 0;

  const formData = new FormData();
  formData.append("FirstName", firstName);
  formData.append("LastName", lastName);
  formData.append("Country", country);
  formData.append("WhatsAppNumber", normalizedWhatsApp);
  formData.append("Bio", bio);
  formData.append("PricePerDay", String(pricePerDay));

  appendFormStringList(formData, "Cities", currentUser?.cities);
  appendFormStringList(formData, "Languages", currentUser?.languages);
  appendFormStringList(formData, "Gallery", currentUser?.gallery);

  return formData;
};

const buildTouristProfileFormData = (updatedData, currentUser, profileUserId) => {
  const firstName = String(
    updatedData.firstName ?? currentUser?.firstName ?? ""
  ).trim();
  const lastName = String(
    updatedData.lastName ?? currentUser?.lastName ?? ""
  ).trim();
  const country = String(
    updatedData.country ?? currentUser?.country ?? ""
  ).trim();
  const whatsAppNumber = String(
    updatedData.whatsAppNumber ?? currentUser?.whatsAppNumber ?? ""
  ).trim();
  const normalizedWhatsApp = normalizeWhatsAppNumber(
    whatsAppNumber,
    currentUser?.whatsAppNumber
  );

  const formData = new FormData();
  formData.append("Id", String(currentUser?.id ?? profileUserId ?? ""));
  formData.append("UserId", String(currentUser?.userId ?? profileUserId ?? ""));
  formData.append("FirstName", firstName);
  formData.append("LastName", lastName);
  formData.append("Country", country);
  formData.append("WhatsAppNumber", normalizedWhatsApp);

  // API expects TouristImage as binary file, not URL/string.
  if (updatedData.touristImage instanceof File) {
    formData.append("TouristImage", updatedData.touristImage);
  }

  return formData;
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
      const profileUserId = storedUserId ?? user?.userId ?? user?.id;

      const endpoint = isTouristRole(role)
        ? `${BASE_URL}/tourists/${profileUserId}/profile`
        : `${BASE_URL}/tour-guides/${profileUserId}/profile`;

      let response;

      if (isTouristRole(role)) {
        const formData = buildTouristProfileFormData(
          updatedData,
          user,
          profileUserId
        );
        response = await axios.put(endpoint, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 || response.status === 204) {
          await getProfileData();
          return { success: true };
        }
      } else {
        const formData = buildTourGuideProfileFormData(updatedData, user);
        response = await axios.put(endpoint, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 || response.status === 204) {
          await getProfileData();
          return { success: true };
        }
      }

      return { success: false, error: "تعذر حفظ التعديلات، حاولي مرة أخرى" };
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      if (err?.response?.data?.errors) {
        console.error("Validation errors:", err.response.data.errors);
      }
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
