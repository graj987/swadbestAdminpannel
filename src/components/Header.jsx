// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Bell, Search, User, LogOut, Settings, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ onMenuClick, onLogout }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [query, setQuery] = useState("");

  const profileRef = useRef();
  const notifRef = useRef();

  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setOpenProfile(false);

      if (notifRef.current && !notifRef.current.contains(e.target))
        setOpenNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Notifications (static for now — later from backend)
  const notifications = [
    { id: 1, text: "New order received", time: "2m ago" },
    { id: 2, text: "Product stock is low", time: "12m ago" },
    { id: 3, text: "New user registered", time: "1h ago" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/admin/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout?.();
    onLogout?.();
  };

  return (
    <header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 z-40">
      <div className="flex items-center justify-between px-6 py-4 md:pl-72">

        {/* MOBILE MENU BUTTON */}
        <button className="md:hidden p-2" onClick={onMenuClick}>
          <Menu size={24} />
        </button>

        {/* SEARCH BAR (Desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1 w-96"
        >
          <Search size={16} className="text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, products, users..."
            className="bg-transparent flex-1 px-3 focus:outline-none text-sm text-gray-700"
          />
          <button className="text-sm text-gray-600 hover:text-gray-800">
            Go
          </button>
        </form>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATIONS */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative p-2 rounded-full hover:bg-gray-100"
              onClick={() => setOpenNotif((s) => !s)}
            >
              <Bell size={20} className="text-gray-700" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {notifications.length}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-3 w-64 bg-white border shadow-xl rounded-lg overflow-hidden z-50">
                <h3 className="px-4 py-2 font-semibold bg-gray-50 border-b">
                  Notifications
                </h3>

                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-2 hover:bg-gray-50">
                    <p className="text-sm font-medium">{n.text}</p>
                    <p className="text-xs text-gray-500">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((s) => !s)}
              className="flex items-center gap-3 px-3 py-1 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={18} className="text-gray-700" />
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold">
                  {admin?.name || "Admin"}
                </span>
                <span className="text-xs text-gray-500">
                  {admin?.email || "admin@example.com"}
                </span>
              </div>
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border rounded-lg overflow-hidden z-50">
                <Link
                  to="/admin/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <User size={16} /> Profile
                </Link>

                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <Settings size={16} /> Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
