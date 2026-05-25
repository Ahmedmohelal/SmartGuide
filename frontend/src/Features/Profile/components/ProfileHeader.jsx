import { MapPin, Mail, Phone, User, Camera } from "lucide-react";
import { useProfile } from "../../../Context/ProfileContext"; // تأكد من المسار صح

// التعديل هنا: ضفنا onEditClick للـ Props
export default function ProfileHeader({ user: userProp, onEditClick }) {
  // دمج الاسم الأول والأخير
  const { user: userFromContext } = useProfile();
  // استخدم ال user prop لو موجود، غير كده استخدم من ال context
  const user = userProp || userFromContext;
  
  const userName = user?.userName || user?.username || "";
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || userName;
  const role = (localStorage.getItem("userRole") || "").toLowerCase();
  const badgeLabel = role === "tourguide" ? "Active Guide" : "Active Tourist";
  
  // صورة افتراضية لو الـ API مرجعش صورة - نستخدم نفس الطريقة اللي بيستخدمها places
  // Tourists use touristImage, Guides use profilePicture
  const avatarUrl =
    (role === "tourist"
      ? user?.touristImage || user?.TouristImage || user?.touristImageUrl || user?.TouristImageUrl
      : user?.profilePicture || user?.ProfilePicture) ||
    user?.touristImage ||
    user?.TouristImage ||
    user?.touristImageUrl ||
    user?.TouristImageUrl ||
    user?.profilePicture ||
    user?.ProfilePicture ||
    user?.image ||
    user?.imageUrl ||
    user?.ImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}&background=0D9488&color=fff`;

  
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-sky-600 to-sky-500 relative overflow-hidden">

  {/* Sun */}
  <div className="absolute top-6 right-16 w-16 h-16 bg-yellow-300 rounded-full opacity-80 animate-pulse"></div>

  {/* Pyramid 1 */}
  <div className="absolute bottom-0 right-20 animate-[float_4s_ease-in-out_infinite]">
    <div className="w-0 h-0 border-l-[70px] border-r-[70px] border-b-[110px]
      border-l-transparent border-r-transparent border-b-yellow-700">
    </div>
  </div>

  {/* Pyramid 2 */}
  <div className="absolute bottom-0 right-52 animate-[float_5s_ease-in-out_infinite]">
    <div className="w-0 h-0 border-l-[50px] border-r-[50px] border-b-[85px]
      border-l-transparent border-r-transparent border-b-yellow-600">
    </div>
  </div>

  {/* Sand moving effect */}
  <div className="absolute bottom-0 w-[200%] h-6 bg-yellow-300 opacity-80
    animate-[sandMove_10s_linear_infinite]">
  </div>

</div>

      {/* Profile Info Section */}
      <div className="px-8 pb-8">
        <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-16">
          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">
              {avatarUrl && !avatarUrl.includes('ui-avatars.com') ? (
                <div 
                  className="w-full h-full rounded-2xl"
                  style={{
                    backgroundImage: `url(${avatarUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-egypt-teal text-white rounded-2xl">
                  <span className="text-2xl font-bold">{fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
              )}
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
