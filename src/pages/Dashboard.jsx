import React, { useEffect, useState } from "react";
import api from "../api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import AdminNotifications from "./AdminNotification";

function getAuthHeader() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const formatCurrency = (v) =>
  typeof v === "number"
    ? v.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : v;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          api.get("/api/admin/stats", { headers: getAuthHeader() }),
          api.get("/api/admin/orders?limit=5", { headers: getAuthHeader() }),
          api.get("/api/admin/products?limit=5", { headers: getAuthHeader() }),
        ]);

        if (!mounted) return;

        setStats({
          usersCount: statsRes.data?.usersCount ?? 0,
          productsCount: statsRes.data?.productsCount ?? 0,
          ordersCount: statsRes.data?.ordersCount ?? 0,
          revenue: statsRes.data?.revenue ?? 0,
        });

        setChartData(
          Array.isArray(statsRes.data?.revenueChart)
            ? statsRes.data.revenueChart.map((d) => ({
                date: d.date,
                revenue: Number(d.revenue),
              }))
            : []
        );

        setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setRecentProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err) {err}
      finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  /* ------------------ LOADING SKELETON ------------------ */
  if (loading)
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl shadow animate-pulse" />
          ))}
        </div>

        <div className="bg-white rounded-xl shadow h-64 mt-6 animate-pulse" />
      </div>
    );

  /* ------------------ MAIN UI ------------------ */
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Users" value={stats.usersCount} color="blue" />
        <StatCard label="Products" value={stats.productsCount} color="green" />
        <StatCard label="Orders" value={stats.ordersCount} color="indigo" />
        <StatCard
          label="Revenue"
          value={`₹${formatCurrency(stats.revenue)}`}
          color="orange"
          />
      </div>

      {/* CHART + RECENT ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHART */}
        <div className="col-span-2 bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue (Last 7 Days)</h2>

          {chartData.length === 0 ? (
            <p className="text-gray-500 text-sm">No revenue data available.</p>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => `₹${formatCurrency(v)}`} />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* RECENT ITEMS */}
        <div className="space-y-8">

          {/* RECENT ORDERS */}
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>

            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No recent orders.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((o) => (
                  <div key={o._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{o.user?.name ?? "User"}</p>
                      <p className="text-xs text-gray-500">{o._id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-semibold">
                        ₹{formatCurrency(o.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500">{o.orderStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT PRODUCTS */}
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Products</h2>

            {recentProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No recent products.</p>
            ) : (
              <div className="space-y-4">
                {recentProducts.map((p) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <img
                      src={p.image}
                      className="w-12 h-12 rounded-lg border object-cover"
                      alt=""
                    />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{formatCurrency(p.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

/* ------------------ STAT CARD ------------------ */
function StatCard({ label, value, color }) {
  const map = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${map[color]}`}>{value}</p>
    </div>
  );
}
