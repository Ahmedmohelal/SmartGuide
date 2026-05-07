import { useState } from "react";
import { useProfile } from "../../Context/ProfileContext";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfoCard from "./components/PersonalInfoCard";
import EditProfileModal from "./components/EditProfileModal";
import { CalendarDays, Globe2, Star, Users } from "lucide-react";
import GuideToursManager from "./components/GuideToursManager";

export default function GuideProfile() {
  const { user, loading, error, updateProfileData } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveProfile = async (newData) => {
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
          Try again
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: "Completed Tours",
      value: user?.completedTours ?? 0,
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Rating",
      value: user?.rating ?? "0.0",
      icon: Star,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Tourists Served",
      value: user?.touristsCount ?? 0,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      <ProfileHeader onEditClick={() => setIsEditModalOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <PersonalInfoCard />

          <div className="bg-gradient-to-br from-indigo-600 to-teal-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100/50">
            <h4 className="font-bold text-lg mb-2">Tour Guide Dashboard</h4>
            <p className="text-indigo-50 text-xs leading-relaxed opacity-90">
              Keep your information updated so your profile looks professional
              and increases your booking opportunities.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <div className={`p-2 rounded-xl ${stat.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-3">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[320px]">
            <h3 className="font-bold text-gray-900 text-lg mb-4 text-right">
              About You as a Guide
            </h3>
            <div className="space-y-4" dir="ltr">
              <div className="flex items-center gap-2 text-gray-700">
                <span>{user?.country || "Egypt"}</span>
                <Globe2 size={18} className="text-egypt-teal" />
              </div>
              <p className="text-sm leading-7 text-gray-600 bg-gray-50 p-4 rounded-2xl">
                {user?.bio ||
                  "Add a short summary about your experience, languages you speak, and tour types to make your profile more appealing to tourists."}
              </p>
            </div>
          </div>

          <GuideToursManager />
        </div>
      </div>

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
