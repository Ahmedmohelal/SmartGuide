import { Routes, Route, Navigate } from "react-router-dom";
// 1. استيراد الكونتيكست والصفحة الجديدة
import { ProfileProvider } from "./context/ProfileContext"; 
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
import Layout from "./Layout/Layout";

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
          
          {/* 3. إضافة مسار البروفايل هنا */}
          <Route path="/profile" element={<Profile />} />
          
          {/* صفحات المستقبل */}
          {/* <Route path="/settings" element={<SettingsPage />} /> */}
        </Route>
      </Routes>
    </ProfileProvider>
  );
}

export default App;