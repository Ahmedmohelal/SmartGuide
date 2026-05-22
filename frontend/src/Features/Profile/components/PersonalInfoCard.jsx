import { Mail, Globe, Phone, ShieldCheck, MessageSquare, MapPin, Languages } from "lucide-react";
import { useProfile } from "../../../Context/ProfileContext"; // تأكد من المسار صح

export default function PersonalInfoCard() {
  // 🔥 دي أهم خطوة: السحب المباشر من الكونتيكست
  const { user } = useProfile(); 

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <h3 className="font-bold text-gray-900 text-lg border-b pb-3">Personal Information</h3>
      
      <div className="space-y-5" dir="ltr">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-teal-50 rounded-2xl">
            <Mail size={20} className="text-egypt-teal" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">Email</p>
            <p className="text-sm font-semibold text-gray-700">{user?.email || "Not available"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-green-50 rounded-2xl">
            <Phone size={20} className="text-green-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">Phone Number</p>
            <p className="text-sm font-semibold text-gray-700">{user?.phoneNumber || "Not provided"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 rounded-2xl">
            <MessageSquare size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">WhatsApp Number</p>
            <p className="text-sm font-semibold text-gray-700">{user?.whatsAppNumber || "Not linked"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-orange-50 rounded-2xl">
            <Globe size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">Country</p>
            <p className="text-sm font-semibold text-gray-700">{user?.country || "Egypt"}</p>
          </div>
        </div>

        {user?.cities && Array.isArray(user.cities) && user.cities.length > 0 && (
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-50 rounded-2xl">
              <MapPin size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-medium tracking-wider mb-2">Cities</p>
              <div className="flex flex-wrap gap-2">
                {user.cities.map((city, index) => (
                  <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {user?.languages && Array.isArray(user.languages) && user.languages.length > 0 && (
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-indigo-50 rounded-2xl">
              <Languages size={20} className="text-indigo-500" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-medium tracking-wider mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {user.languages.map((language, index) => (
                  <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}