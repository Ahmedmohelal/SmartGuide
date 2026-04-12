import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/guide-verification" element={<GuideVerification />} />
      <Route path="/otp" element={<OTP/>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

    </Routes>
  );
}

export default App;
