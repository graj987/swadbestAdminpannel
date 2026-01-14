import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../utils/socket";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Load unread notifications
  useEffect(() => {
    api.get("/api/admin/notification").then(res => {
      setNotifications(res.data.notifications || []);
    });
  }, []);

  // Realtime socket
  useEffect(() => {
    socket.on("admin-notification", (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => socket.off("admin-notification");
  }, []);

  const unreadCount = notifications.length;

  const handleClick = async (n) => {
    await api.put(`/api/admin/notification/${n._id}/read`);
    setNotifications(prev => prev.filter(i => i._id !== n._id));
    setOpen(false);
    navigate(n.link);
  };

  return (
    <div className="relative">

      {/* 🔔 Bell */}
      <button onClick={() => setOpen(v => !v)} className="relative">
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs h-4 w-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border z-50 max-h-96 overflow-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">
              No new notifications
            </p>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                className="p-4 border-b cursor-pointer hover:bg-gray-50"
              >
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-xs text-gray-600 mt-1">{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
