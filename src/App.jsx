// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProudcts";
import UpdateProduct from "./pages/UpdateProduct";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Setting";


/* -------------------------------------------
   PROTECTED ROUTE WRAPPER
--------------------------------------------- */
function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return <div className="p-6">Checking authentication…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}

/* -------------------------------------------
   ADMIN LAYOUT
--------------------------------------------- */
function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex">

      {/* FIXED SIDEBAR */}
      <aside className="w-64 fixed left-0 top-0 h-screen z-50">
        <Sidebar onLogout={logout} />
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-64">

        {/* FIXED HEADER THAT ALIGNS WITH SIDEBAR */}
        <Header onLogout={logout} />

        {/* PAGE CONTENT (SCROLLABLE) */}
        <div className="p-6 pt-24">
          <Outlet />
        </div>

      </div>
    </div>

  );
}

/* -------------------------------------------
   MAIN APP ROUTER
--------------------------------------------- */
export default function App() {
  return (
  
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root → dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Public route */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="product" element={<Products />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="products/:id" element={<UpdateProduct />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />


            {/* fallback inside /admin */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
    
  );
}
