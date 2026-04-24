import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfoCard from "./components/PersonalInfoCard";
import TouristTrips from "./components/TouristTrips";
import EditProfileModal from "./components/EditProfileModal";
import { toast } from "react-hot-toast"; // أو المكتبة اللي بتستخدمها للـ Alerts

export default function TouristProfile() {
  const { user, loading, error, updateProfileData } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // دالة معالجة حفظ البيانات الجديدة
// تأكد إنك مش حاطط (e) هنا، حط (newData)
const handleSaveProfile = async (newData) => {
  console.log("البيانات اللي وصلت للأب:", newData);
  
  // لو لقيت newData طالعة رقم في الكونسول، يبقى المشكلة في المودال 100%
  const result = await updateProfileData(newData);
  
  if (result.success) {
    setIsEditModalOpen(false);
  }
};
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-egypt-teal border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100 m-4">
        <p className="text-red-600 font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-sm underline text-red-500"
        >
          حاول مرة أخرى
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      
      {/* 1. الهيدر (بنمرر له دالة فتح الـ Modal عشان زرار الـ Edit) */}
      <ProfileHeader 
        user={user} 
        onEditClick={() => setIsEditModalOpen(true)} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. العمود الجانبي (المعلومات الشخصية) */}
        <div className="lg:col-span-4 space-y-6">
          <PersonalInfoCard />
          
          {/* كارت إضافي بسيط لتجميل الشكل */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-6 rounded-[2rem] text-white shadow-xl shadow-teal-100/50">
            <h4 className="font-bold text-lg mb-2">مرحباً بك في مصر! 🇪🇬</h4>
            <p className="text-teal-50 text-xs leading-relaxed opacity-90">
              اكتشف أسرار الحضارة المصرية مع أفضل المرشدين المحليين. رحلتك القادمة تبدأ من هنا.
            </p>
          </div>
        </div>

        {/* 3. العمود الرئيسي (الرحلات المحجوزة) */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[500px]">
            <TouristTrips />
          </div>
        </div>

      </div>

      {/* 4. نافذة التعديل (تظهر فقط عند الضغط على Edit Profile) */}
      {isEditModalOpen && (
        <EditProfileModal 
          user={user} 
          onClose={() => setIsEditModalOpen(false)} 
          onSave={handleSaveProfile} 
        />
      )}
    </div>
  );
}