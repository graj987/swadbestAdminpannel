// src/pages/Users.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../api"; // optional: axios instance; we still add headers here
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const normalizeUsers = useCallback((raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.users)) return raw.users;
    if (Array.isArray(raw.results)) return raw.results;
    if (typeof raw === "object") {
      const arr = Object.values(raw).find((v) => Array.isArray(v));
      if (arr) return arr;
    }
    return [];
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      try {
        setError(null);
        setLoading(true);
        // attach auth header explicitly
        const res = await api.get("/api/admin/users", {
          headers: getAuthHeader(),
        });
        if (!mounted) return;
        const arr = normalizeUsers(res.data);
        setUsers(arr);
      } catch (err) {
        // handle 401 explicitly
        const status = err?.response?.status;
        if (status === 401) {
          // token missing/expired — clear and redirect to login
          localStorage.removeItem("adminToken");
          // Optional: show message then redirect
          setError("Unauthorized. Redirecting to login...");
          setTimeout(() => navigate("/admin/login"), 800);
          return;
        }
        console.error("Users fetch error:", err);
        setError("Failed to fetch users");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, [navigate, normalizeUsers]);

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-4">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.length === 0 && (
          <p className="text-center text-gray-600 col-span-full">No users found.</p>
        )}

        {users.map((user) => (
          <div
            key={user._id ?? user.id}
            className="bg-white shadow rounded-xl p-4 border hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">{user.name ?? "Unknown User"}</h2>
            <p className="text-sm text-gray-700">Email: {user.email ?? "N/A"}</p>
            <p className="text-sm text-gray-700">Phone: {user.phone ?? "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
