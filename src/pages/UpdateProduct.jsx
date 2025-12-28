import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import imageCompression from "browser-image-compression";

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "Other",
    stock: 1,
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/admin/products/${id}`);
        const p = res.data;

        setForm({
          name: p.name,
          price: p.price,
          description: p.description,
          category: p.category,
          stock: p.stock,
        });

        setPreview(p.image);
      } catch (err) {
        setError("Failed to load product",err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const compressed = await imageCompression(f, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
    });

    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  };

  const uploadImage = async () => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await api.post("/api/admin/upload", fd);
    return res.data.secure_url;
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);

      let imageUrl = preview;
      if (file) imageUrl = await uploadImage();

      await api.put(`/api/admin/products/${id}`, {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        image: imageUrl,
      });

      navigate("/admin/product");
    } catch (err) {
      setError("Failed to update product",err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-6 text-center text-lg">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-5 text-center">Update Product</h1>

      {error && (
        <p className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
          {error}
        </p>
      )}

      <form
        onSubmit={saveProduct}
        className="bg-white p-5 rounded-xl border shadow grid md:grid-cols-2 gap-5"
      >
        {/* LEFT COMPACT FORM */}
        <div className="space-y-3">

          <div>
            <label className="text-sm font-medium">Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded text-sm"
            />
          </div>

          {/* PRICE + STOCK (compact row) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Price (₹)</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Stock</label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded text-sm"
              />
            </div>
          </div>

          {/* CATEGORY (compact row) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-medium">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded bg-white text-sm"
              >
                <option>Snacks</option>
                <option>Meal</option>
                <option>Sweets</option>
                <option>Pickles</option>
                <option>Drinks</option>
                <option>Other</option>
              </select>
            </div>

            {/* empty field you can use later (GST %, discount, rating, etc.) */}
            <div />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded resize-none text-sm"
            />
          </div>
        </div>

        {/* RIGHT SIDE IMAGE COMPACT */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Product Image</label>

          <div className="w-full h-48 bg-gray-100 border rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="text-sm"
          />

          {saving && (
            <p className="text-blue-600 text-sm font-medium">Saving...</p>
          )}
        </div>

        {/* BUTTON FULL WIDTH */}
        <div className="md:col-span-2">
          <button
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
