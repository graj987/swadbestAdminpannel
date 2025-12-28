// src/pages/AdminDashboard.jsx
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

function getAuthHeader() {
  const token = localStorage.getItem("adminToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

const formatCurrency = (v) =>
  typeof v === "number" ? v.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : v;

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    let isActive = true; // genuine, React-18-safe pattern

    const load = async () => {
      if (!isActive) return;
      setLoading(true);

      try {
        // Try consolidated stats endpoint first
        try {
          const res = await api.get("/api/admin/stats", {
            headers: getAuthHeader(),
          });
          const d = res?.data ?? {};

          if (!isActive) return;

          setStats({
            users: Number(d.users ?? 0),
            products: Number(d.products ?? 0),
            orders: Number(d.orders ?? 0),
            revenue: Number(d.revenue ?? 0),
          });

          const chart = Array.isArray(d.revenueChart) ? d.revenueChart : [];
          setChartData(
            chart.map((c) => ({
              date: String(c.date ?? c.label ?? ""),
              revenue: Number(c.revenue ?? c.value ?? 0),
            }))
          );
        } catch (e) {
          e
          if (!isActive) return;

          const [uR, pR, oR] = await Promise.all([
            api.get("/api/admin/users/count", { headers: getAuthHeader() }).catch(() => ({ data: { count: 0 } })),
            api.get("/api/admin/products/count", { headers: getAuthHeader() }).catch(() => ({ data: { count: 0 } })),
            api.get("/api/admin/orders/count", { headers: getAuthHeader() }).catch(() => ({ data: { count: 0 } })),
          ]);

          if (!isActive) return;

          setStats({
            users: Number(uR.data?.count ?? 0),
            products: Number(pR.data?.count ?? 0),
            orders: Number(oR.data?.count ?? 0),
            revenue: 0,
          });
          setChartData([]);
        }

        // Recent items (orders + products)
        if (!isActive) return;

        const [ro, rp] = await Promise.all([
          api.get("/api/admin/orders?limit=5", { headers: getAuthHeader() }).catch(() => ({ data: [] })),
          api.get("/api/products?limit=5", { headers: getAuthHeader() }).catch(() => ({ data: [] })),
        ]);

        if (!isActive) return;

        const ordersRaw = ro.data?.data ?? ro.data ?? [];
        const productsRaw = rp.data?.data ?? rp.data ?? [];

        setRecentOrders(Array.isArray(ordersRaw) ? ordersRaw : []);
        setRecentProducts(Array.isArray(productsRaw) ? productsRaw : []);
      } catch (err) {
        // ignore client-side cancellations, surface others
        const canceled = err?.code === "ERR_CANCELED" || err?.name === "CanceledError";
        if (!canceled && isActive) {
          console.error("Dashboard load error:", err);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();

    return () => {
      // mark inactive so we don't set state after unmount
      isActive = false;
    };
  }, []);

  if (loading)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="space-y-3">
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Products" value={stats.products} />
        <StatCard label="Orders" value={stats.orders} />
        <StatCard label="Revenue" value={`₹${formatCurrency(stats.revenue)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Revenue (last 7 days)</h2>
          {chartData.length === 0 ? (
            <div className="text-sm text-gray-500">No chart data available.</div>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${formatCurrency(value)}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="url(#colorRev)" fillOpacity={1} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <div className="text-sm text-gray-500">No recent orders.</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id ?? o.id ?? Math.random()} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{o.user?.name ?? (typeof o.userId === "string" ? o.userId : "—")}</div>
                      <div className="text-sm text-gray-600">Order: {o._id ?? o.id ?? "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{formatCurrency(Number(o.totalAmount ?? 0))}</div>
                      <div className="text-sm text-gray-600">{o.orderStatus ?? "—"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="mt-4 font-semibold">Recent Products</h3>
          {recentProducts.length === 0 ? (
            <div className="text-sm text-gray-500">No recent products.</div>
          ) : (
            <div className="space-y-2 mt-2">
              {recentProducts.map((p) => (
                <div key={p._id ?? p.id ?? Math.random()} className="flex items-center gap-3">
                  <img
                    src={p.image ?? p.images?.[0] ?? "/placeholder-100x100.png"}
                    alt={p.name ?? "product"}
                    onError={(e) => (e.currentTarget.src = "/placeholder-100x100.png")}
                    className="w-12 h-12 object-cover rounded bg-gray-100"
                  />
                  <div>
                    <div className="font-medium">{p.name ?? "Unnamed product"}</div>
                    <div className="text-sm text-gray-600">₹{formatCurrency(Number(p.price ?? 0))}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Small reusable stat card */
function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
