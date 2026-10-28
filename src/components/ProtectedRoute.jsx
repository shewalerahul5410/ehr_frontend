import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;