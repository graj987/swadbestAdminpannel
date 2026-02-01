import React from "react";
import { useEffect, useState } from "react";
import socket from "@/utils/socket";
import api from "@/api";

export default function useAdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  // initial fetch
  useEffect(() => {
    api.get("/api/admin/notification").then((res) => {
      setNotifications(res.data.notifications || []);
    });
  }, []);

  // realtime socket
  useEffect(() => {
    socket.connect();

    socket.on("admin-notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("admin-notification");
    };
  }, []);

  const markAsRead = async (id) => {
    await api.put(`/api/admin/notification/${id}/read`);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return {
    notifications,
    unreadCount: notifications.length,
    markAsRead,
  };
}
