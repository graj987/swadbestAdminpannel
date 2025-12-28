// src/App.jsx
import React, { memo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProducts from "./pages/AddProudcts";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Login from "./pages/Login";

/**
 * ProtectedRoute: wait while auth verifies, then protect based on `admin`
 * (checking `admin` avoids redirect loops when token exists but verification is pending)
 */
function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return <div className="p-6">Checking authentication...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}

/**
 * MainLayout uses Outlet so nested routes are defined in one place.
 * Memo to avoid re-rendering layout unless props/context change.
 */
const MainLayout = memo(function MainLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex">
      <Sidebar onLogout={logout} />
      <div className="flex-1 ml-64">
        <Header onLogout={logout} />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
});

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root -> admin dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="/admin/login" element={<Login />} />

          {/* Admin area: protect the whole subtree */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* index redirects to absolute dashboard path */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* NOTE: path "product" matches Sidebar's "/admin/product" */}
            <Route path="product" element={<Products />} />
            <Route path="add-product" element={<AddProducts />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />

            {/* catch-all within admin subtree */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
