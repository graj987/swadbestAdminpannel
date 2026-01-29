import React from "react";
import { useEffect, useState } from "react";
import api from "../api";
import { Search, Truck, Barcode, FileText, PackageX } from "lucide-react";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

const Badge = ({ text, cls }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
    {text}
  </span>
);

const ORDER = {
  placed: "bg-gray-100 text-gray-700",
  preparing: "bg-blue-100 text-blue-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT = {
  pending: "bg-gray-100 text-gray-600",
  initiated: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const SHIPPING = {
  created: "bg-blue-100 text-blue-700",
  shipped: "bg-orange-100 text-orange-700",
  in_transit: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rto: "bg-red-200 text-red-800",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);

  const loadOrders = async () => {
    const res = await api.get("/api/admin/orders", auth());
    setOrders(res.data.orders || res.data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const generateAWB = async (orderId) => {
    await api.post(`/api/shiprocket/order/${orderId}/awb`, {}, auth());
    loadOrders();
  };

  const generateLabel = async (shipmentId) => {
    const res = await api.get(`/api/shiprocket/label/${shipmentId}`, auth());
    if (res.data?.labelUrl) window.open(res.data.labelUrl, "_blank");
  };

  const cancelShipment = async (orderId) => {
    if (!confirm("Cancel / RTO this shipment?")) return;
    await api.post(`/api/shiprocket/order/${orderId}/cancel`, {}, auth());
    loadOrders();
  };

  const trackShipment = (awb) => {
    window.open(`/admin/track/${awb}`, "_blank");
  };

  const toggleSelect = (id) => {
    if (!id) return;
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };

  const generateManifest = async () => {
    if (!selected.length) return;
    const res = await api.post(
      "/api/shiprocket/manifest",
      { shipmentIds: selected },
      auth()
    );
    if (res.data?.manifestUrl) window.open(res.data.manifestUrl, "_blank");
    setSelected([]);
  };

  const filtered = orders.filter((o) =>
    query ? o._id.includes(query) : true
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2 border px-3 py-2 rounded">
          <Search size={14} />
          <input
            className="outline-none text-sm"
            placeholder="Search order id"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {selected.length > 0 && (
        <button
          onClick={generateManifest}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Generate Manifest ({selected.length})
        </button>
      )}

      <div className="grid gap-3">
        {filtered.map((o) => {
          const paid = o.paymentStatus === "paid";
          const shipmentId = o.shipping?.shipmentId;
          const awb = o.shipping?.awb;
          const s = o.shipping?.status;

          const canCancel =
            awb && !["in_transit", "out_for_delivery", "delivered"].includes(s);

          return (
            <div
              key={o._id}
              className="border rounded-lg p-4 flex justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={!shipmentId}
                    checked={selected.includes(shipmentId)}
                    onChange={() => toggleSelect(shipmentId)}
                  />
                  <span className="text-sm font-medium">
                    {o._id.slice(-8)}
                  </span>
                </div>

                <div className="text-sm">₹{o.totalAmount}</div>

                <div className="flex gap-1 flex-wrap">
                  <Badge text={o.orderStatus} cls={ORDER[o.orderStatus]} />
                  <Badge text={o.paymentStatus} cls={PAYMENT[o.paymentStatus]} />
                  {s && <Badge text={s} cls={SHIPPING[s]} />}
                </div>

                {awb && <div className="text-xs text-gray-600">AWB: {awb}</div>}
              </div>

              <div className="flex flex-col gap-2 text-sm">
                {shipmentId && !awb && (
                  <button
                    disabled={!paid}
                    onClick={() => generateAWB(o._id)}
                    className={`px-3 py-1 rounded flex gap-1 ${
                      paid
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Barcode size={14} /> Generate AWB
                  </button>
                )}

                {awb && (
                  <>
                    <button
                      onClick={() => trackShipment(awb)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded flex gap-1"
                    >
                      <Truck size={14} /> Track
                    </button>

                    <button
                      onClick={() => generateLabel(shipmentId)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded flex gap-1"
                    >
                      <FileText size={14} /> Print Label
                    </button>

                    <button
                      disabled={!canCancel}
                      onClick={() => cancelShipment(o._id)}
                      className={`px-3 py-1 rounded flex gap-1 ${
                        canCancel
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <PackageX size={14} /> Cancel / RTO
                    </button>

                    <p className="text-xs text-gray-500">
                      Parcel packed → hand over to courier
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
