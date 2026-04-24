import { useState } from "react";
import { useNavigate } from "react-router-dom";
import registerImage from "../assets/images/register.png";
import { Globe, MapPin, Check } from "lucide-react";
import { Link } from "react-router-dom";


export default function SelectRole() {
  const [role, setRole] = useState("tourist");
  const navigate = useNavigate();

  const handleContinue = () => {
    // في الحالتين هنوديه لصفحة التسجيل الأول عشان يملأ بياناته
    // بس بنبعت معاها الـ role عشان لو حبيت تظهر/تخفي حاجات في صفحة التسجيل بناءً عليه
    navigate("/register", { state: { selectedRole: role } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-7xl grid md:grid-cols-2 overflow-hidden">

        {/* LEFT IMAGE */}
        <div className="hidden md:block relative min-h-[900px] overflow-hidden">
          <img
            src={registerImage}
            alt="travel"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-violet-400/30 to-transparent" />

          <div className="absolute inset-0 z-20 flex items-start justify-start p-10">
            <h1 className="text-5xl font-bold leading-snug drop-shadow-lg bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Welcome <br /> Back <br /> Again
            </h1>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold mb-2">Choose Your Role</h2>

          <p className="text-gray-500 text-sm mb-8">
            Tell us how you want to experience the world
          </p>

          {/* TOURIST */}
          <div
            onClick={() => setRole("tourist")}
            className={`relative border p-5 rounded-lg mb-4 cursor-pointer transition ${
              role === "tourist"
                ? "border-green-600 bg-green-50"
                : "border-gray-200"
            }`}
          >
            {/* CHECK */}
            {role === "tourist" && (
              <div className="absolute top-3 right-3 text-green-600">
                <Check size={20} />
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <Globe size={20} />
              <h3 className="font-medium">Tourist</h3>
            </div>

            <p className="text-sm text-gray-500">
              Explore new destinations and find unique experiences.
            </p>
          </div>

          {/* GUIDE */}
          <div
            onClick={() => setRole("guide")}
            className={`relative border p-5 rounded-lg cursor-pointer transition ${
              role === "guide"
                ? "border-green-600 bg-green-50"
                : "border-gray-200"
            }`}
          >
            {/* CHECK */}
            {role === "guide" && (
              <div className="absolute top-3 right-3 text-green-600">
                <Check size={20} />
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <MapPin size={20} />
              <h3 className="font-medium">Tour Guide</h3>
            </div>

            <p className="text-sm text-gray-500">
              Share your local knowledge and lead unforgettable journeys.
            </p>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleContinue}
            className="w-full mt-8 bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition font-medium"
          >
            Continue
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-700 font-medium">
                Sign in
              </Link>
          </p>
        </div>
      </div>
    </div>
  );
}