import React from "react";

export default function StatsCard({ title, value, icon, color = "blue" }) {
  const bg = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
  }[color];

  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4 border hover:shadow-lg transition">
      {icon && (
        <div className={`p-3 rounded-full ${bg} text-xl`}>{icon}</div>
      )}
      <div>
        <div className="text-sm text-gray-500 font-medium">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
