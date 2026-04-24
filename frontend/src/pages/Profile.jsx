import { useProfile } from "../context/ProfileContext";
import { Navigate } from "react-router-dom";
import TouristProfile from "../Features/Profile/TouristProfile";
import GuideProfile from "../Features/Profile/GuideProfile";

export default function Profile() {
  const { user, loading, error } = useProfile();
  
  // بنجيب الـ Role من الـ Storage عشان نضمن الدقة
  const storedRole = localStorage.getItem("userRole");
  const normalizedRole = storedRole?.toLowerCase();

  if (loading) return <div className="p-20 text-center">جاري التحميل...</div>;

  // لو مفيش يوزر وفيه ايرور، يبقى التوكن باظ، ارجع للوجن
  if (error && !user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto">
        {/* الشرط المعدل: بنقارن بالكلمة اللي إنت مخزنها بالظبط */}
        {normalizedRole === "tourist" ? (
          <TouristProfile user={user} />
        ) : (
          <GuideProfile user={user} />
        )}
      </div>
    </div>
  );
}