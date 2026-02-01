import { useEffect, useState } from "react";
import api from "@/api";
import socket from "@/utils/socket";

export default function useAdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    api.get("/api/admin/notification").then(res => {
      setNotifications(res.data.notifications || []);
    });

    socket.on("admin-notification", (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => socket.off("admin-notification");
  }, []);

  const markAsRead = async (id) => {
    await api.put(`/api/admin/notification/${id}/read`);
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
  };

  return { notifications, unreadCount, markAsRead };
}
