import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import useAdminNotifications from "@/hooks/useAdminNotification";

export default function AdminNotificationsPage() {
  const { notifications, markAsRead } = useAdminNotifications();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All recent admin activity
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 && (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Bell className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            No notifications yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            You’re all caught up.
          </p>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => {
              markAsRead(n._id);
              navigate(n.link);
            }}
            className="
              group cursor-pointer
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-xl p-4
              shadow-sm hover:shadow-md
              transition-all
            "
          >
            <div className="flex items-start gap-3">
              {/* DOT */}
              {!n.read && (
                <span className="mt-2 w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}

              <div className="flex-1">
                <h4
                  className="
                    font-semibold
                    text-gray-900 dark:text-white
                    group-hover:text-blue-600 dark:group-hover:text-blue-400
                    transition
                  "
                >
                  {n.title}
                </h4>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {n.message}
                </p>

                {n.createdAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
