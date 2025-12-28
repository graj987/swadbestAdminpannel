// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  // while verifying token, render nothing (or spinner) — prevents redirect loop
  if (loading) return <div />; // or <LoadingSpinner />

  // not logged in -> redirect once
  if (!admin) return <Navigate to="/admin/login" replace />;

  // logged in -> render child routes
  return children;
}
