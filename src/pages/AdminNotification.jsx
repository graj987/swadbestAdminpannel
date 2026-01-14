import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../utils/socket";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  /* LOAD EXISTING */
  useEffect(() => {
    const load = async () => {
      const res = await api.get("/api/admin/notification");
      setNotifications(res.data.notifications || []);
    };
    load();
  }, []);

  /* SOCKET REAL-TIME */
  useEffect(() => {
    socket.on("admin-notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => socket.off("admin-notification");
  }, []);

  /* CLICK HANDLER */
  const openNotification = async (n) => {
    await api.put(`/api/admin/notification/${n._id}/read`);

    setNotifications((prev) =>
      prev.filter((item) => item._id !== n._id)
    );

    navigate(n.link);
  };

  if (!notifications.length) return null;

  return (
    <div className="fixed top-16 right-4 w-80 z-50">
      {notifications.map((n) => (
        <div
          key={n._id}
          onClick={() => openNotification(n)}
          className="
            bg-white p-4 mb-3 rounded-xl shadow-lg
            cursor-pointer hover:bg-gray-50
            transition
          "
        >
          <h4 className="font-semibold text-sm">{n.title}</h4>
          <p className="text-xs text-gray-600 mt-1">
            {n.message}
          </p>
        </div>
      ))}
    </div>
  );
}
