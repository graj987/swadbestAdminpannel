import React, { useEffect, useState } from "react";
import api from "../api";
import useAuth from "@/Hooks/useAuth";

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  product: "",
  discountType: "percentage",
  discountValue: "",
  startTime: "",
  endTime: "",
  type: "flash",
};

const OffersAdmin = () => {
  const { getAuthHeader } = useAuth();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  /* ---------- LOAD DATA ---------- */
  const loadData = async () => {
    const [offersRes, productsRes] = await Promise.all([
      api.get("/api/offers/all", { headers: getAuthHeader() }),
      api.get("/api/products"),
    ]);

    setOffers(offersRes.data.data || []);
    setProducts(productsRes.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);
  

  /* ---------- CREATE OFFER ---------- */
  const createOffer = async () => {
    if (!form.title || !form.image || !form.product) {
      alert("Missing required fields");
      return;
    }

    setLoading(true);
    await api.post("/api/offers", form, {
      headers: getAuthHeader(),
    });

    setForm(emptyForm);
    await loadData();
    setLoading(false);
  };

  /* ---------- TOGGLE ---------- */
  const toggleOffer = async (id) => {
    await api.patch(`/api/offers/${id}/toggle`, {}, {
      headers: getAuthHeader(),
    });
    loadData();
  };

  /* ---------- DELETE ---------- */
  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    await api.delete(`/api/offers/${id}`, {
      headers: getAuthHeader(),
    });
    loadData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔥 Offers Management</h1>

      {/* ================= CREATE ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-10 grid md:grid-cols-3 gap-4">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          placeholder="Subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="border p-2 rounded"
        />

        <select
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="flash">Flash Sale</option>
          <option value="latest">Latest Offer</option>
        </select>

        <select
          value={form.discountType}
          onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>

        <input
          type="number"
          placeholder="Discount value"
          value={form.discountValue}
          onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="datetime-local"
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="datetime-local"
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          className="border p-2 rounded"
        />

        <button
          disabled={loading}
          onClick={createOffer}
          className="bg-orange-600 text-white py-2 rounded font-semibold col-span-full"
        >
          {loading ? "Creating..." : "Create Offer"}
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4">
        {offers.map((o) => (
          <div
            key={o._id}
            className="flex items-center justify-between bg-white p-4 rounded-xl shadow border"
          >
            <div>
              <p className="font-semibold">{o.title}</p>
              <p className="text-xs text-gray-500">
                {o.type.toUpperCase()} • {o.discountValue}
                {o.discountType === "percentage" ? "%" : "₹"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toggleOffer(o._id)}
                className={`px-4 py-1 rounded text-sm font-semibold ${
                  o.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {o.isActive ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => deleteOffer(o._id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersAdmin;
