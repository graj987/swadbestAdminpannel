import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AdminNotifications from "../pages/AdminNotification";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden md:block w-64 h-screen fixed left-0 top-0 z-50">
        <Sidebar />
      </aside>

      {/* ================= SIDEBAR OVERLAY (MOBILE) ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR DRAWER (MOBILE) ================= */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-white border-r shadow-lg z-50
        transform transition-transform md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col md:ml-64">

        {/* HEADER */}
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* 🔔 ADMIN NOTIFICATIONS (GLOBAL) */}
        <AdminNotifications />

        {/* CONTENT */}
        <main className="p-6 pt-24">
          {children}
        </main>

      </div>

    </div>
  );
}
