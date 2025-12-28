// src/pages/Orders.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../api";


const getAuthHeader = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch  {
  // ignore: abort may throw; nothing to do here
}
      }
    };
  }, []);

  const normalizeOrders = useCallback((raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.orders)) return raw.orders;
    if (Array.isArray(raw.results)) return raw.results;
    if (Array.isArray(raw.payload?.items)) return raw.payload.items;
    if (typeof raw === "object" && !Array.isArray(raw)) {
      const arr = Object.values(raw).find((v) => Array.isArray(v));
      if (arr) return arr;
    }
    return [];
  }, []);

  const extractTotalPages = useCallback((raw, _limit) => {
    if (!raw) return null;
    const total =
      raw.total ??
      raw.count ??
      raw.totalDocs ??
      raw.totalItems ??
      raw.meta?.total ??
      raw.pagination?.total;
    if (typeof total === "number" && _limit) {
      return Math.max(1, Math.ceil(total / _limit));
    }
    if (raw.totalPages || raw.pages) return raw.totalPages ?? raw.pages;
    return null;
  }, []);

  // single, stable loadOrders declaration (no duplicates)
  const loadOrders = useCallback(
    async (opts = { usePage: true, endpoint: "/api/admin/orders" }) => {
      // reset visible errors for this request
      setError(null);
      setLoading(true);

      // cancel previous
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch  {
  // ignore: abort may throw; nothing to do here
} 
      }
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      try {
        const params = opts.usePage ? `?page=${page}&limit=${limit}` : "";
        const res = await api.get(`${opts.endpoint}${params}`, {
          headers: getAuthHeader(),
          signal,
        });

        const arr = normalizeOrders(res.data);
        const tPages = extractTotalPages(res.data, limit);

        if (!mountedRef.current) return;
        setOrders(arr);
        setTotalPages(tPages);
      } catch (err) {
        if (api.isCancel?.(err) || err?.name === "CanceledError") {
          // aborted - ignore
          return;
        }
        console.error("loadOrders error:", err);
        if (!mountedRef.current) return;
        setError("Failed to fetch orders. Check auth and backend.");
        setOrders([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [page, limit, normalizeOrders, extractTotalPages]
  );

  // initial load + page changes
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const searchHandler = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!query?.trim()) {
        setPage(1);
        loadOrders();
        return;
      }

      // abort previous
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch  {
  // ignore: abort may throw; nothing to do here
}
      }
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      setLoading(true);
      setError(null);

      try {
        const endpoint = `/api/orders/search?q=${encodeURIComponent(query)}`;
        const res = await api.get(endpoint, { headers: getAuthHeader(), signal });
        const arr = normalizeOrders(res.data);
        const tPages = extractTotalPages(res.data, limit);

        if (!mountedRef.current) return;
        setOrders(arr);
        setTotalPages(tPages);
      } catch (err) {
        if (api.isCancel?.(err) || err?.name === "CanceledError") return;
        console.error("search error:", err);
        if (!mountedRef.current) return;
        setError("Search failed");
        setOrders([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [query, limit, normalizeOrders, extractTotalPages, loadOrders]
  );

  const updateStatus = useCallback(
    async (id, status) => {
      if (!window.confirm(`Change order status to "${status}"?`)) return;

      const matchFn = (o) =>
        o._id === id || o.id === id || String(o._id) === String(id) || String(o.id) === String(id);

      // optimistic update
      setOrders((prev) => prev.map((o) => (matchFn(o) ? { ...o, orderStatus: status } : o)));
      if (selectedOrder && matchFn(selectedOrder)) setSelectedOrder((s) => ({ ...s, orderStatus: status }));

      try {
        await api.put(`/api/amdin/orders/${id}/status`, { status }, { headers: getAuthHeader() });
      } catch (err) {
        console.error("updateStatus error:", err);
        // revert (best-effort)
        setOrders((prev) => prev.map((o) => (matchFn(o) ? { ...o, orderStatus: o.orderStatus ?? o.status ?? "pending" } : o)));
        if (selectedOrder && matchFn(selectedOrder)) setSelectedOrder((s) => ({ ...s, orderStatus: s.orderStatus ?? s.status ?? "pending" }));
        alert("Failed to update status");
      }
    },
    [selectedOrder]
  );

  const viewDetails = useCallback((order) => {
    const products =
      order.products ?? order.items ?? order.orderItems ?? order.data ?? order.productsArray ?? [];
    setSelectedOrder({ ...order, products: Array.isArray(products) ? products : [] });
  }, []);

  const closeDetails = useCallback(() => setSelectedOrder(null), []);

  const idOf = (o) => o._id ?? o.id ?? Math.random();
  const getStatus = (o) => o.orderStatus ?? o.status ?? "pending";
  const getUserName = (o) => o.user?.name ?? o.user?.email ?? o.userId ?? "-";
  const getAmount = (o) => o.totalAmount ?? o.amount ?? 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>

        <form onSubmit={searchHandler} className="flex items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, user, phone, or product"
            className="border px-3 py-2 rounded-l w-64"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
        </div>
      ) : error ? (
        <p className="text-center text-red-600 p-4">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {(!orders || orders.length === 0) && <p className="text-center text-gray-600">No orders found.</p>}

            {orders.map((order) => {
              const id = idOf(order);
              const status = getStatus(order);
              const userName = getUserName(order);
              const amount = getAmount(order);
              return (
                <div
                  key={id}
                  className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      Order: <span className="font-normal">{id}</span>
                    </p>
                    <p className="text-sm">User: {userName}</p>
                    <p className="text-sm">Amount: ₹{amount}</p>
                    <p className="text-sm">
                      Status: <span className="font-medium">{status}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3 md:mt-0">
                    <button onClick={() => viewDetails(order)} className="px-3 py-1 border rounded">
                      Details
                    </button>

                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(id, "processing")} className="px-3 py-1 border rounded">
                        Processing
                      </button>
                      <button onClick={() => updateStatus(id, "shipped")} className="px-3 py-1 border rounded">
                        Shipped
                      </button>
                      <button onClick={() => updateStatus(id, "delivered")} className="px-3 py-1 border rounded">
                        Delivered
                      </button>
                    </div>

                    <button onClick={() => updateStatus(id, "cancelled")} className="px-3 py-1 bg-red-500 text-white rounded">
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span>
              Page {page}
              {totalPages ? ` / ${totalPages}` : ""}
            </span>

            <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">
              Next
            </button>
          </div>
        </>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-2/3 max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button onClick={closeDetails} className="px-3 py-1 border rounded">
                Close
              </button>
            </div>

            <p>
              <strong>Order ID:</strong> {selectedOrder._id ?? selectedOrder.id}
            </p>
            <p>
              <strong>Status:</strong> {selectedOrder.orderStatus ?? selectedOrder.status}
            </p>
            <p>
              <strong>Total:</strong> ₹{selectedOrder.totalAmount ?? selectedOrder.amount}
            </p>
            <p>
              <strong>User:</strong> {selectedOrder.user?.name ?? selectedOrder.userId ?? "-"}
            </p>
            <p>
              <strong>Phone:</strong> {selectedOrder.shippingInfo?.phoneNo ?? selectedOrder.phone ?? "-"}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {selectedOrder.shippingInfo
                ? `${selectedOrder.shippingInfo.address ?? ""}, ${selectedOrder.shippingInfo.city ?? ""}, ${selectedOrder.shippingInfo.postalCode ?? ""}`
                : "-"}
            </p>

            <h3 className="mt-4 font-semibold">Products</h3>
            <div className="grid gap-3 mt-2">
              {(selectedOrder.products ?? []).length === 0 && <p className="text-sm text-gray-600">No products data available.</p>}
              {(selectedOrder.products ?? []).map((p, idx) => {
                const pid = p.productId ?? p._id ?? idx;
                const img = p.image ?? p.product?.image ?? "/placeholder-100x100.png";
                const name = p.name ?? p.product?.name ?? "Unnamed product";
                const qty = p.quantity ?? p.qty ?? 1;
                const price = p.price ?? p.product?.price ?? 0;
                return (
                  <div key={pid} className="flex items-center gap-3 border rounded p-3">
                    <img src={img} alt={name} className="w-16 h-16 object-cover rounded" onError={(e) => (e.currentTarget.src = "/placeholder-100x100.png")} />
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-sm">Qty: {qty}</div>
                      <div className="text-sm">Price: ₹{price}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => updateStatus(selectedOrder._id ?? selectedOrder.id, "shipped")} className="px-4 py-2 border rounded">
                Mark Shipped
              </button>
              <button onClick={() => updateStatus(selectedOrder._id ?? selectedOrder.id, "delivered")} className="px-4 py-2 bg-green-600 text-white rounded">
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
