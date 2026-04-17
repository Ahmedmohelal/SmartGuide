import { MapPin, Mail, Phone, User, Camera } from "lucide-react";
import { useProfile } from "../../../Context/ProfileContext"; // تأكد من المسار صح

// التعديل هنا: ضفنا onEditClick للـ Props
export default function ProfileHeader({ onEditClick }) {
  // دمج الاسم الأول والأخير
  const { user } = useProfile();
  const userName = user?.userName || user?.username || "";
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || userName;
  const role = (localStorage.getItem("userRole") || "").toLowerCase();
  const badgeLabel = role === "tourguide" ? "Active Guide" : "Active Tourist";
  
  // صورة افتراضية لو الـ API مرجعش صورة
  const avatarUrl =
    user?.touristImage ||
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}&background=0D9488&color=fff`;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-egypt-teal to-blue-500 relative">
        <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-all">
          <Camera size={20} className="text-white" />
        </button>
      </div>

      {/* Profile Info Section */}
      <div className="px-8 pb-8">
        <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-16">
          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Name & Badge */}
          <div className="flex-1 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {fullName}
              <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full uppercase tracking-wider">
                {badgeLabel}
              </span>
            </h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <User size={16} /> @{userName}
            </p>
          </div>

          {/* Edit Button */}
          <button 
            onClick={onEditClick}
            className="bg-egypt-teal text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-100"
          >
            Edit Profile
          </button>
        </div>

        {/* Contact Info Bar */}
        <div className="mt-8 pt-8 border-t border-gray-50 flex flex-wrap gap-6 text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
            <Mail size={18} className="text-egypt-teal" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
            <MapPin size={18} className="text-egypt-teal" />
            <span>{user?.country || "Egypt"}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
            <Phone size={18} className="text-egypt-teal" />
            <span>{user?.whatsAppNumber || "No WhatsApp linked"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}