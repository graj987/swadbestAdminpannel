// src/pages/Orders.jsx
import React, { useState, useEffect } from "react";
import api from "../api";
import { X, Search, PackageCheck, Truck, CheckCircle, Trash2 } from "lucide-react";



const getAuthHeader = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [query, setQuery] = useState("");

  // =========================
  // LOAD ALL ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/orders", {
        headers: getAuthHeader(),
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Orders load error:", err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (id, status) => {
    if (!confirm(`Change status to: ${status}?`)) return;

    try {
      await api.put(
        `/api/admin/orders/${id}/status`,
        { status },
        { headers: getAuthHeader() }
      );

      // Reflect instantly
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, orderStatus: status } : o
        )
      );

      if (selectedOrder?._id === id) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: status }));
      }
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status");
    }
  };

  // =========================
  // FILTER
  // =========================
  const filteredOrders = orders.filter((o) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      o._id?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    );
  });

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>

        <div className="flex items-center gap-2 bg-white shadow px-3 py-2 rounded-lg border">
          <Search className="text-gray-500" size={18} />
          <input
            className="outline-none"
            placeholder="Search orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-gray-600">Loading orders...</div>
      )}

      {/* EMPTY */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center text-gray-500 py-10">No orders found.</div>
      )}

      {/* ORDER LIST */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white border rounded-xl shadow p-4 flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-semibold">{order._id}</p>

              <p className="mt-2 text-sm">
                <strong>User:</strong>{" "}
                {order.user?.name || order.user?.email || "-"}
              </p>

              <p className="text-sm">
                <strong>Total:</strong> ₹{order.totalAmount}
              </p>

              <p className="text-sm">
                <strong>Status:</strong>{" "}
                <span className="font-semibold text-blue-600">
                  {order.orderStatus}
                </span>
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedOrder(order)}
                className="px-4 py-1 text-sm border rounded-lg hover:bg-gray-100"
              >
                View Details
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateStatus(order._id, "processing")}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg"
                >
                  Processing
                </button>
                <button
                  onClick={() => updateStatus(order._id, "shipped")}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg"
                >
                  Shipped
                </button>
                <button
                  onClick={() => updateStatus(order._id, "delivered")}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg"
                >
                  Delivered
                </button>
                <button
                  onClick={() => updateStatus(order._id, "cancelled")}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
           ORDER DETAILS MODAL
      ========================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
            {/* Close */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Order ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.orderStatus}
              </p>
              <p>
                <strong>Total:</strong> ₹{selectedOrder.totalAmount}
              </p>
              <p>
                <strong>User:</strong> {selectedOrder.user?.name}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {selectedOrder.shippingInfo
                  ? `${selectedOrder.shippingInfo.address}, ${selectedOrder.shippingInfo.city}`
                  : "-"}
              </p>

              <h3 className="font-semibold mt-4">Products</h3>
              <div className="grid gap-3">
                {selectedOrder.products?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 border p-2 rounded-lg">
                    <img
                      src={p.image}
                      className="w-14 h-14 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm">Qty: {p.quantity}</p>
                      <p className="text-sm">Price: ₹{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* QUICK STATUS UPDATE */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() =>
                    updateStatus(selectedOrder._id, "shipped")
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Mark Shipped
                </button>

                <button
                  onClick={() =>
                    updateStatus(selectedOrder._id, "delivered")
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
