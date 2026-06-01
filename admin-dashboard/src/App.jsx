import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PendingGuidesPage from "./pages/PendingGuidesPage";
import GuidesPage from "./pages/GuidesPage";
import UsersPage from "./pages/UsersPage";
import CreateAdminPage from "./pages/CreateAdminPage";
import ToursPage from "./pages/ToursPage";
import BookingsPage from "./pages/BookingsPage";
import RevenuePage from "./pages/RevenuePage";
import AuditPage from "./pages/AuditPage";
import { getToken, isAdmin } from "./utils/tokenUtils";

function RootRedirect() {
  if (getToken() && isAdmin()) return <Navigate to="/" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="guides/pending" element={<PendingGuidesPage />} />
          <Route path="guides" element={<GuidesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="create-admin" element={<CreateAdminPage />} />
          <Route path="tours" element={<ToursPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </ThemeProvider>
  );
}
