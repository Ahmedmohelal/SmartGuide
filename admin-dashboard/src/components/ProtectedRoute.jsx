import { Navigate } from "react-router-dom";
import { getToken, isAdmin } from "../utils/tokenUtils";

export default function ProtectedRoute({ children }) {
  if (!getToken() || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
