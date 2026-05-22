import { useState } from "react";
import { X, Save, Camera, Upload, Plus, Trash2 } from "lucide-react";

const ArrayInputField = ({ label, placeholder, values, onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="p-3 bg-egypt-teal text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-egypt-teal/10 text-egypt-teal px-3 py-1.5 rounded-full"
              >
                <span className="text-sm font-medium">{value}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function EditProfileModal({ user, onClose, onSave }) {
  // 1. تأكد إن الـ Keys هنا مطابقة للي الباك-إند مستنيه (بص على الـ Get اللي عملناه)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    whatsAppNumber: user?.whatsAppNumber || "",
    country: user?.country || "",
    bio: user?.bio || "",
    cities: Array.isArray(user?.cities) ? user.cities : (user?.cities ? [user.cities] : []),
    languages: Array.isArray(user?.languages) ? user.languages : (user?.languages ? [user.languages] : []),
    profilePicture: null,
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState(
    user?.touristImage ||
      user?.TouristImage ||
      user?.touristImageUrl ||
      user?.TouristImageUrl ||
      user?.profilePicture ||
      user?.ProfilePicture ||
      null
  );
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
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
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
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            />
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

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Country</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Bio</label>
            <textarea
              rows="3"
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-egypt-teal resize-none"
              placeholder="Tell about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          <ArrayInputField
            label="Cities"
            placeholder="e.g., Cairo"
            values={formData.cities}
            onChange={(cities) => setFormData({...formData, cities})}
          />

          <ArrayInputField
            label="Languages"
            placeholder="e.g., Arabic"
            values={formData.languages}
            onChange={(languages) => setFormData({...formData, languages})}
          />

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
