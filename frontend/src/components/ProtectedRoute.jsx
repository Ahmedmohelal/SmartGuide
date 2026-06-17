import React from "react";
import { Navigate } from "react-router-dom";
import { useProfile } from "../Context/ProfileContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useProfile();

  const token = localStorage.getItem("token");

  if (loading) return null;

  const isAuthenticated = !!token && user && Object.keys(user).length > 0;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
