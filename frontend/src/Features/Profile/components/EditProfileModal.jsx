import { useState } from "react";
import { X, Save } from "lucide-react";

export default function EditProfileModal({ user, onClose, onSave }) {
  // 1. تأكد إن الـ Keys هنا مطابقة للي الباك-إند مستنيه (بص على الـ Get اللي عملناه)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    whatsAppNumber: user?.whatsAppNumber || "",
    country: user?.country || "",
  });

 // داخل ملف EditProfileModal.jsx

const handleSubmit = (e) => {
  e.preventDefault(); // منع الصفحة من التحميل
  
  // 🛑 تأكد إنك باعت formData مش e أو أي حاجة تانية
  console.log("البيانات اللي هتتبعت من المودال:", formData); 
  
  onSave(formData); 
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-right" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">تعديل الملف الشخصي</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الاسم الأول</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الاسم الأخير</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">رقم الواتساب</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
              value={formData.whatsAppNumber}
              onChange={(e) => setFormData({...formData, whatsAppNumber: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-egypt-teal text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <Save size={18} /> حفظ التغييرات
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-xl font-bold">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}