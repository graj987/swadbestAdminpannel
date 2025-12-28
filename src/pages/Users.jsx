// src/pages/Users.jsx
import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const authHeader = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ============= FETCH USERS =============
  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        const res = await api.get("/api/admin/users", {
          headers: authHeader(),
        });

        if (!active) return;

        const arr = Array.isArray(res.data.users)
          ? res.data.users
          : Array.isArray(res.data)
          ? res.data
          : [];

        setUsers(arr);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("adminToken");
          setError("Session expired. Redirecting...");
          setTimeout(() => navigate("/admin/login"), 1000);
          return;
        }

        console.error("User fetch error:", err);
        setError("Failed to fetch users");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUsers();
    return () => (active = false);
  }, [navigate]);

  // ============= LOADING UI =============
  if (loading)
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow border animate-pulse"
          >
            <div className="h-5 bg-gray-200 w-1/2 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 w-3/4 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 w-2/5 rounded"></div>
          </div>
        ))}
      </div>
    );

  // ============= ERROR UI =============
  if (error)
    return (
      <p className="text-center p-4 text-red-600 font-medium">{error}</p>
    );

  // ============= MAIN RENDER =============
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">
            No users found.
          </p>
        )}

        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white p-5 rounded-xl shadow border hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-semibold text-lg">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>

              <div>
                <h2 className="font-semibold text-lg">
                  {user.name || "Unknown User"}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {user.phone || "N/A"}
              </p>
              <p>
                <span className="font-medium">Registered:</span>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
