// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";
import { ThemeProvider } from "./pages/TheamProvider";

/* ================= LAYOUT ================= */
import AdminLayout from "./layouts/AdminLayouts";

/* ================= PAGES ================= */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProudcts";
import UpdateProduct from "./pages/UpdateProduct";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Settings from "./pages/Setting";
import AdminHero from "./pages/AdminHero";
import AdminNotificationsPage from "./components/NotificatoinBell";
import AdminBlogs from "./pages/BlogPost";
import AddBlog from "./pages/AddBlog";
import EditBlog from "./pages/EditBlog";
import AdminTrack from "./pages/AdminTrack";

/* ================= PROTECTED ROUTE ================= */

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Checking authentication…</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

/* ================= APP ================= */

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* ROOT */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            {/* PUBLIC */}
            <Route path="/admin/login" element={<Login />} />

            {/* PROTECTED ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* DASHBOARD */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* PRODUCTS */}
              <Route path="product" element={<Products />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="products/:id" element={<UpdateProduct />} />

              {/* ORDERS */}
              <Route path="orders" element={<Orders />} />
              <Route path="track/:awb" element={<AdminTrack />} />

              {/* USERS */}
              <Route path="users" element={<Users />} />

              {/* BLOGS */}
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="blogs/new" element={<AddBlog />} />
              <Route path="blogs/edit/:id" element={<EditBlog />} />

              {/* OTHER */}
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="add-hero" element={<AdminHero />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />

              {/* FALLBACK */}
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
