import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Search,
  X,
  Truck,
  PackageCheck,
  CheckCircle,
  MapPin,
  FileText,
  RefreshCw,
  Barcode,
} from "lucide-react";

const getAuthHeader = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  // LOAD ORDERS
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/orders", { headers: getAuthHeader() });
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // UPDATE STATUS
  const updateStatus = async (orderId, status) => {
    if (!confirm(`Change status to: ${status}?`)) return;

    await api.put(
      `/api/admin/orders/${orderId}/status`,
      { status },
      { headers: getAuthHeader() }
    );

    setOrders((p) =>
      p.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o))
    );
    if (selected?._id === orderId) {
      setSelected((prev) => ({ ...prev, orderStatus: status }));
    }
  };

  // SHIPROCKET → SYNC ORDER
  const syncShiprocket = async (orderId) => {
    try {
      const res = await api.post(
        res.send(
          "/api/shiprocket/create-orde", // your route
          { orderId },
          { headers: getAuthHeader() }
        ));

      alert("Synced with Shiprocket");
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Shiprocket sync failed");
    }
  };

const getLabel = async (orderId) => {
  try {
    const res = await api.get(
      `/api/shiprocket/label/${orderId}`,
      { headers: getAuthHeader() }
    );

    const url = res.data?.labelUrl;
    if (!url) return alert("Label not available");

    window.open(url, "_blank"); // open PDF
  } catch (err) {
    console.error("Label failed:", err);
    alert("Failed to generate label");
  }
};

// =========================
// DOWNLOAD MANIFEST
// =========================
const getManifest = async (shipmentId) => {
  try {
    const res = await api.get(
      `/api/shiprocket/manifest/${shipmentId}`,
      { headers: getAuthHeader() }
    );

    const url = res.data?.manifestUrl;
    if (!url) return alert("Manifest not available");

    window.open(url, "_blank");
  } catch (err) {
    console.error("Manifest failed:", err);
    alert("Manifest generation failed");
  }
};


  // SHIPROCKET → GENERATE AWB
  const generateAWB = async (orderId) => {
    try {
      const res = await api.post(
        "/api/shiprocket/awb",
        { orderId },
        { headers: getAuthHeader() }
      );

      alert(`AWB Generated: ${res.data.awb}`);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate AWB");
    }
  };


  // SHIPROCKET → TRACK
  const trackShipment = async (awb) => {
    try {
      const res = await api.get(
        `/api/shiprocket/track/${awb}`,
        { headers: getAuthHeader() }
      );

      alert(JSON.stringify(res.data, null, 2));
    } catch {
      alert("Unable to track shipment");
    }
  };

  const filtered = orders.filter((o) =>
    query.trim()
      ? o._id.toLowerCase().includes(query.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(query.toLowerCase())
      : true
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>

        <div className="flex items-center gap-2 bg-white shadow px-3 py-2 rounded-lg border">
          <Search size={18} className="text-gray-500" />
          <input
            placeholder="Search orders..."
            className="outline-none text-sm"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-600">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No orders found</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((o) => (
            <div
              key={o._id}
              className="bg-white border rounded-xl p-4 shadow flex justify-between"
            >
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-semibold">{o._id}</p>

                <p className="mt-1 text-sm">
                  <strong>User:</strong> {o.user?.name}
                </p>

                <p className="text-sm">
                  <strong>Total:</strong> ₹{o.totalAmount}
                </p>

                <p className="text-sm">
                  <strong>Status:</strong>{" "}
                  <span className="font-medium text-blue-600">
                    {o.orderStatus}
                  </span>
                </p>

                {o.shiprocketOrderId && (
                  <p className="text-sm mt-1 text-green-600">
                    Shiprocket Synced ✔
                  </p>
                )}
                {o.awb && (
                  <p className="text-sm text-orange-600">
                    AWB: {o.awb}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <button
                  onClick={() => setSelected(o)}
                  className="border px-3 py-1 rounded hover:bg-gray-100"
                >
                  View
                </button>

                <button
                  onClick={() => syncShiprocket(o._id)}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded flex gap-1 items-center"
                >
                  <RefreshCw size={14} /> Sync
                </button>

                <button
                  onClick={() => generateAWB(o._id)}
                  className="bg-orange-100 text-orange-700 px-3 py-1 rounded flex gap-1 items-center"
                >
                  <Barcode size={14} /> AWB
                </button>

                {o.awb && (
                  <button
                    onClick={() => trackShipment(o.awb)}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded flex gap-1 items-center"
                  >
                    <Truck size={14} /> Track
                  </button>
                )}

                <button
                  onClick={() => updateStatus(o._id, "shipped")}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded"
                >
                  Shipped
                </button>

                <button
                  onClick={() => updateStatus(o._id, "delivered")}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded"
                >
                  Delivered
                </button>

                {o.shipmentId && (
                  <button
                    onClick={() => getLabel(o._id)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded"
                  >
                    Label
                  </button>
                )}

                {o.shipmentId && (
                  <button
                    onClick={() => getManifest(o.shipmentId)}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded"
                  >
                    Manifest
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative shadow-xl">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            <p><strong>Order ID:</strong> {selected._id}</p>
            <p><strong>Status:</strong> {selected.orderStatus}</p>
            <p><strong>Total:</strong> ₹{selected.totalAmount}</p>

            <h3 className="mt-4 font-semibold flex items-center gap-2">
              <MapPin size={18} /> Shipping Address
            </h3>
            <p className="text-sm">
              {selected.address?.name}, {selected.address?.phone}<br />
              {selected.address?.line1}<br />
              {selected.address?.city} - {selected.address?.pincode}
            </p>

            <h3 className="mt-4 font-semibold flex items-center gap-2">
              <FileText size={18} /> Products
            </h3>

            <div className="mt-2 grid gap-3">
              {selected.products?.map((p, idx) => (
                <div key={idx} className="flex gap-2 border p-2 rounded">
                  <div className="flex-1">
                    <p className="font-medium">{p.product?.name}</p>
                    <p className="text-sm">Qty: {p.quantity}</p>
                    <p className="text-sm">₹{p.priceAtPurchase}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => updateStatus(selected._id, "shipped")}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Mark Shipped
              </button>

              <button
                onClick={() => updateStatus(selected._id, "delivered")}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
