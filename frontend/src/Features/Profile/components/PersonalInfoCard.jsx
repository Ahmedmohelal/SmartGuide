import { Mail, Globe, Phone, ShieldCheck } from "lucide-react";
import { useProfile } from "../../../Context/ProfileContext"; // تأكد من المسار صح

export default function PersonalInfoCard() {
  // 🔥 دي أهم خطوة: السحب المباشر من الكونتيكست
  const { user } = useProfile(); 

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <h3 className="font-bold text-gray-900 text-lg border-b pb-3 text-right">المعلومات الشخصية</h3>
      
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-4 text-right">
          <div className="p-2.5 bg-teal-50 rounded-2xl">
            <Mail size={20} className="text-egypt-teal" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">البريد الإلكتروني</p>
            <p className="text-sm font-semibold text-gray-700">{user?.email || "غير متوفر"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div className="p-2.5 bg-blue-50 rounded-2xl">
            <Globe size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">الدولة</p>
            <p className="text-sm font-semibold text-gray-700">{user?.country || "مصر"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div className="p-2.5 bg-green-50 rounded-2xl">
            <Phone size={20} className="text-green-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">رقم الواتساب</p>
            <p className="text-sm font-semibold text-gray-700">{user?.whatsAppNumber || "لم يتم الربط"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}