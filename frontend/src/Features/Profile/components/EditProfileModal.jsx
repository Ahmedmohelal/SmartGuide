import { useState } from "react";
import { X, Save, Camera, Upload } from "lucide-react";

export default function EditProfileModal({ user, onClose, onSave }) {
  // 1. تأكد إن الـ Keys هنا مطابقة للي الباك-إند مستنيه (بص على الـ Get اللي عملناه)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    whatsAppNumber: user?.whatsAppNumber || "",
    country: user?.country || "",
    profilePicture: null,
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profilePicture || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData({ ...formData, profilePicture: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

 // داخل ملف EditProfileModal.jsx

const handleSubmit = async (e) => {
  e.preventDefault(); // منع الصفحة من التحميل
  
  setIsUploading(true);
  
  try {
    // 🛑 تأكد إنك باعت formData مش e أو أي حاجة تانية
    console.log("البيانات اللي هتتبعت من المودال:", formData); 
    
    await onSave(formData); 
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile. Please try again.");
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="ltr">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center pb-6 border-b">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-egypt-teal text-white">
                    <Camera size={32} />
                  </div>
                )}
              </div>
              <label htmlFor="profilePicture" className="absolute bottom-0 right-0 bg-egypt-teal text-white p-2 rounded-full cursor-pointer hover:bg-egypt-teal/90 transition-colors shadow-lg">
                <Upload size={16} />
              </label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Click camera icon to upload profile picture
              <br />
              Max size: 5MB • JPG, PNG, GIF
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">WhatsApp Number</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
              value={formData.whatsAppNumber}
              onChange={(e) => setFormData({...formData, whatsAppNumber: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={isUploading}
              className="flex-1 bg-egypt-teal text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isUploading}
              className="px-6 py-3 bg-gray-100 rounded-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}