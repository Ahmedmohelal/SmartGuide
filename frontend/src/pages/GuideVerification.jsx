import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IdCard, File, X, Loader2 } from "lucide-react";
import authService from "../Services/authService";

export default function GuideVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const basicInfo = location.state?.basicInfo;

  const [idFile, setIdFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_SIZE = 5 * 1024 * 1024;

  // ✅ حماية الصفحة لو مفيش بيانات
  if (!basicInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-bold text-center p-6">
        Missing registration data. Please go back and register again.
      </div>
    );
  }

  const validateFile = (file) => {
    if (!file) return false;
    if (file.size > MAX_SIZE) {
      alert("File must be less than 5MB");
      return false;
    }
    return true;
  };

  const handleDrop = (e, setter) => {
    e.preventDefault();
    setDragging(null);
    const file = e.dataTransfer.files[0];
    if (validateFile(file)) setter(file);
  };

  const handleSelect = (e, setter) => {
    const file = e.target.files[0];
    if (validateFile(file)) setter(file);
  };

  const handleFormSubmit = async () => {
    if (!idFile || !licenseFile) {
      setError("Please upload both ID and License documents.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // ✅ safe append (من غير ما يحصل crash)
      formData.append("FirstName", basicInfo?.FirstName || "");
      formData.append("LastName", basicInfo?.LastName || "");
      formData.append("UserName", basicInfo?.UserName || "");
      formData.append("Country", basicInfo?.Country || "");
      formData.append("Email", basicInfo?.Email || "");
      formData.append("Password", basicInfo?.Password || "");
      formData.append("ConfirmPassword", basicInfo?.ConfirmPassword || "");
      formData.append("Role", basicInfo?.Role || "TourGuide");

      // الملفات
      formData.append("NationalIdImage", idFile);
      formData.append("GuideLicenseImage", licenseFile);

      await authService.register(formData);

      alert("Registration submitted successfully! You can now login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({ id, file, setFile, Icon, label }) => {
    const FileIcon = Icon;

    return (
      <div className="mb-8">
        <p className="mb-3 font-medium text-sm flex items-center gap-2 text-gray-700">
          <FileIcon size={20} className="text-green-700" />
          {label}
        </p>

        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition cursor-pointer
          ${dragging === id ? "border-green-600 bg-green-50" : "border-gray-300 hover:bg-gray-50"}
          ${file ? "border-green-500 bg-green-50/30" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(id);
          }}
          onDragLeave={() => setDragging(null)}
          onDrop={(e) => handleDrop(e, setFile)}
          onClick={() => document.getElementById(id).click()}
        >
          <FileIcon size={40} className={`mx-auto mb-3 ${file ? "text-green-600" : "text-gray-400"}`} />

          <p className="text-gray-700 font-medium">
            {file ? "File ready!" : "Drag & drop your file here"}
          </p>

          <p className="text-gray-400 text-xs mt-1">
            {file ? file.name : "JPG, PNG, PDF — Max 5MB"}
          </p>

          <button
            type="button"
            className={`mt-4 px-5 py-2 rounded-lg transition text-sm font-medium ${
              file ? "bg-green-100 text-green-700" : "bg-green-700 text-white hover:bg-green-800"
            }`}
          >
            {file ? "Change File" : "Select File"}
          </button>

          <input
            id={id}
            type="file"
            hidden
            onChange={(e) => handleSelect(e, setFile)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 md:p-10">

        <button
          onClick={() =>
            navigate("/register", { state: { selectedRole: "guide" } })
          }
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <h2 className="text-2xl font-bold mb-1 text-gray-800 text-center">
          Verify Your Profile
        </h2>

        <p className="text-gray-500 text-sm mb-8 text-center uppercase tracking-widest font-bold">
          Step 2: Document Upload
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <UploadBox
          id="idInput"
          file={idFile}
          setFile={setIdFile}
          Icon={IdCard}
          label="National ID Image"
        />

        <UploadBox
          id="licenseInput"
          file={licenseFile}
          setFile={setLicenseFile}
          Icon={File}
          label="Tour Guide License Image"
        />

        <button
          onClick={handleFormSubmit}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg transition font-bold text-lg
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 shadow-lg"}`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Finalizing Account...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>
      </div>
    </div>
  );
}