import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { ProfileProvider } from "./Context/ProfileContext";
import Layout from "./Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// صفحات صغيرة - تحميل عادي
import Login from "./pages/Login";
import Register from "./pages/Register";
import GuideVerification from "./pages/GuideVerification";
import OTP from "./pages/OTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SelectRole from "./pages/SelectRole";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Support from "./pages/Support";

// صفحات كبيرة - Lazy Loading
const Profile = lazy(() => import("./pages/Profile"));
const Tours = lazy(() => import("./pages/Tours"));
const TourDetails = lazy(() => import("./pages/TourDetails"));
const Places = lazy(() => import("./pages/Places"));
const PlaceDetails = lazy(() => import("./pages/PlaceDetails"));
const SavedPlaces = lazy(() => import("./pages/SavedPlaces"));
const SavedGuides = lazy(() => import("./pages/SavedGuides"));
const GuideDashboard = lazy(() => import("./pages/GuideDashboard"));
const GuideProfilePublic = lazy(() =>
  import("./pages/GuideProfilePublic")
);
const TouristProfilePublic = lazy(() =>
  import("./pages/TouristProfilePublic")
);
const Chat = lazy(() => import("./pages/Chat"));
const Notifications = lazy(() => import("./pages/Notifications"));

function App() {
  return (
    <ProfileProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
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

          {/* صفحات داخل Layout */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/support" element={<Support />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="/guides/:id" element={<GuideProfilePublic />} />
            <Route path="/tourists/:id" element={<TouristProfilePublic />} />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat/:conversationId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:id" element={<TourDetails />} />


            <Route path="/places" element={<Places />} />

            <Route
              path="/saved-places"
              element={
                <ProtectedRoute>
                  <SavedPlaces />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved-guides"
              element={
                <ProtectedRoute>
                  <SavedGuides />
                </ProtectedRoute>
              }
            />

            <Route
              path="/guide-dashboard"
              element={
                <ProtectedRoute>
                  <GuideDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/places/:id" element={<PlaceDetails />} />
          </Route>
        </Routes>
      </Suspense>
    </ProfileProvider>
  );
}

export default App;