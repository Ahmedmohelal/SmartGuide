import { Routes, Route, Navigate } from "react-router-dom";
// 1. استيراد الكونتيكست والصفحة الجديدة
import { ProfileProvider } from "./Context/ProfileContext";
import Profile from "./pages/Profile";

// استدعاء الصفحات التانية
import Login from "./pages/Login";
import Register from "./pages/Register";
import GuideVerification from "./pages/GuideVerification";
import OTP from "./pages/OTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SelectRole from "./pages/SelectRole";
import Home from "./pages/Home";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import Layout from "./Layout/Layout";
import Tours from "./pages/Tours";
import TourDetails from "./pages/TourDetails";
import Places from "./pages/Places";
import PlaceDetails from "./pages/PlaceDetails";
import SavedPlaces from "./pages/SavedPlaces";
import SavedGuides from "./pages/SavedGuides";
import GuideDashboard from "./pages/GuideDashboard";

function App() {
  return (
    // 2. تغليف التطبيق بالـ Provider عشان الـ API يشتغل في كل حتة
    <ProfileProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/select-role" />} />

        {/* صفحات بدون Navbar و Footer */}
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/guide-verification" element={<GuideVerification />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* صفحات جوه الـ Layout (التي تحتوي على Navbar و Footer) */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/support" element={<Support />} />

          {/* 3. إضافة مسار البروفايل هنا */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetails />} />

          {/* صفحات المستقبل */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/places" element={<Places />} />
          <Route path="/saved-places" element={<SavedPlaces />} />
          <Route path="/saved-guides" element={<SavedGuides />} />
          <Route path="/guide-dashboard" element={<GuideDashboard />} />

          <Route path="/places/:id" element={<PlaceDetails />} />
        </Route>
      </Routes>
    </ProfileProvider>
  );
}

export default App;
