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
        role === "Tourist"
          ? `${BASE_URL}/tourists/${userId}/profile`
          : `${BASE_URL}/tour-guides/${userId}/profile`;

      const response = await axios.get(`${endpoint}?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({ ...response.data });
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

    // تأكد إننا بنبعت الأوبجيكت صح مش الرقم اللي ظهرلك ده
    const payload = {
      id: user?.id,               
      userId: user?.userId,       
      firstName: String(updatedData.firstName), // التأكد إنه نص
      lastName: String(updatedData.lastName),   // التأكد إنه نص
      userName: user?.userName,   
      email: user?.email,         
      country: updatedData.country || user?.country,
      whatsAppNumber: String(updatedData.whatsAppNumber || user?.whatsAppNumber),
      touristImage: user?.touristImage || ""
    };

    console.log("الـ Payload اللي رايح للسيرفر دلوقتي:", payload);

    const endpoint = role === "Tourist" 
      ? `${BASE_URL}/tourists/${user?.userId}/profile`
      : `${BASE_URL}/tour-guides/${user?.userId}/profile`;

    const response = await axios.put(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200 || response.status === 204) {
      // تحديث محلي فوري بالقيم النصية
      setUser(prev => ({ ...prev, ...payload }));
      
      // ندي السيرفر وقته يثبت الداتا
      setTimeout(() => getProfileData(), 1500);
      
      return { success: true };
    }
  } catch (err) {
    console.error("خطأ الـ Payload:", err.response?.data);
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
