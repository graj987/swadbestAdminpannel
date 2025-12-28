import React, { useState } from "react";
import { useAuth } from "../context/useAuth"; // <- fixed import (was ../context/AuthProvider)
import { Bell, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header({ onLogout }) {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleLogout = () => {
    if (onLogout) onLogout();
    // Make sure context logout runs as well
    if (logout) logout();
  };

  return (
    <header className="bg-white border-b p-4 pl-72">{/* account for sidebar width */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1 w-full md:w-96">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders, users, products..."
              className="bg-transparent flex-1 px-3 focus:outline-none text-sm"
            />
            <button type="button" className="text-sm text-gray-600" onClick={() => {/* implement search navigation */}}>
              Go
            </button>
          </form>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded hover:bg-gray-100">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">3</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setOpen((s) => !s)}
              className="flex items-center gap-3 px-3 py-1 rounded hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium">{admin?.name ?? "Admin"}</div>
                <div className="text-xs text-gray-500">{admin?.email ?? "admin@example.com"}</div>
              </div>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
                <Link to="/admin/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">Profile</Link>
                <Link to="/admin/settings" className="block px-4 py-2 text-sm hover:bg-gray-50">Settings</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
