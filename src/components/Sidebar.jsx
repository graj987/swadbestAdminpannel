// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  PlusCircle,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export default function Sidebar({ onLogout, onClose }) {
  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
    { label: "Products", icon: Package, to: "/admin/product" },
    { label: "Add Product", icon: PlusCircle, to: "/admin/add-product" },
    { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
    { label: "Users", icon: Users, to: "/admin/users" },
    { label: "Profile", icon: Users, to: "/admin/profile" },
    { label: "Settings", icon: Settings, to: "/admin/settings" }

  ];

  return (
    <aside
      className="
        w-64 h-screen bg-white border-r shadow-lg p-6 flex flex-col
        fixed top-0 left-0 z-50 md:static
      "
    >
      {/* MOBILE CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
      >
        <X size={20} />
      </button>

      {/* LOGO */}
      <div className="mb-10 mt-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Admin<span className="text-blue-600">Panel</span>
        </h1>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `
              flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer
              transition-all text-sm font-medium
              ${isActive
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                : "text-gray-700 hover:bg-gray-100"}
            `
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={onLogout}
        className="
          flex items-center gap-3 px-4 py-2.5 mt-6
          rounded-lg bg-red-50 text-red-700
          hover:bg-red-100 border border-red-200
          transition-all text-sm font-medium
        "
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}
