// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, PlusCircle, LogOut } from "lucide-react";

export default function Sidebar({ onLogout }) {
  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, to: "/admin/dashboard", exact: true },
    { label: "Products", icon: <Package size={20} />, to: "/admin/product", exact: true },
    { label: "Add Product", icon: <PlusCircle size={20} />, to: "/admin/add-product" },
    { label: "Orders", icon: <ShoppingCart size={20} />, to: "/admin/orders" },
    { label: "Users", icon: <Users size={20} />, to: "/admin/users" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white shadow-lg border-r fixed top-0 left-0 p-4 flex flex-col" aria-label="Admin sidebar">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <nav className="flex-1 space-y-2" aria-label="Main navigation">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={!!item.exact} // exact match for dashboard/products
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-100 ${
                isActive ? "bg-gray-200 text-blue-700" : "text-gray-700"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-2 mt-4 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
        aria-label="Logout"
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
}
