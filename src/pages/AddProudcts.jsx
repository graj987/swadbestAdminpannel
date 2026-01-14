import React, { useState, useRef, useEffect } from "react";
import api from "../api";

export default function AddProducts() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Other",
    variants: [{ weight: "250 g", price: "", stock: "" }],
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const uploadRef = useRef();

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const updateVariant = (index, key, value) => {
    const variants = [...form.variants];
    variants[index][key] = value;
    setForm({ ...form, variants });
  };

  const addVariant = () => {
    setForm({
      ...form,
      variants: [...form.variants, { weight: "", price: "", stock: "" }],
    });
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/"))
      return setError("Only image files allowed");

    if (f.size > 2 * 1024 * 1024)
      return setError("Image must be below 2MB");

    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setForm({
      name: "",
      description: "",
      category: "Other",
      variants: [{ weight: "250 g", price: "", stock: "" }],
    });
    setImageFile(null);
    setPreview("");
    uploadRef.current.value = "";
  };

  /* ================= SUBMIT ================= */

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const firstVariant = form.variants[0];

    if (!form.name.trim()) return setError("Product name is required");
    if (!form.description.trim())
      return setError("Product description is required");
    if (!imageFile) return setError("Product image is required");

    if (
      !firstVariant ||
      !firstVariant.weight ||
      firstVariant.price === "" ||
      firstVariant.stock === ""
    ) {
      return setError("At least one valid variant is required");
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("category", form.category);

    // BACKEND EXPECTS SINGLE VARIANT
    fd.append("weight", firstVariant.weight);
    fd.append("price", Number(firstVariant.price));
    fd.append("stock", Number(firstVariant.stock));

    fd.append("image", imageFile);

    try {
      setLoading(true);

      await api.post("/api/admin/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Product added successfully");
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-5 text-center">Add Product</h1>

      {error && <p className="mb-3 text-red-600 text-center">{error}</p>}
      {success && <p className="mb-3 text-green-600 text-center">{success}</p>}

      <form
        onSubmit={submit}
        className="bg-white p-5 rounded-xl border shadow space-y-5"
      >
        {/* BASIC INFO */}
        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>Snacks</option>
          <option>Meal</option>
          <option>Sweets</option>
          <option>Pickles</option>
          <option>Drinks</option>
          <option>Other</option>
        </select>

        {/* VARIANTS */}
        <h3 className="font-semibold">Variants (at least one)</h3>

        {form.variants.map((v, i) => (
          <div key={i} className="grid grid-cols-3 gap-3">
            <input
              placeholder="Weight (e.g. 250 g)"
              value={v.weight}
              onChange={(e) => updateVariant(i, "weight", e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={v.price}
              onChange={(e) => updateVariant(i, "price", e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Stock"
              value={v.stock}
              onChange={(e) => updateVariant(i, "stock", e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          + Add Variant (future use)
        </button>

        {/* IMAGE */}
        <input
          type="file"
          ref={uploadRef}
          accept="image/*"
          onChange={handleFile}
        />

        {preview && (
          <img
            src={preview}
            className="w-full h-48 object-cover rounded"
            alt="Preview"
          />
        )}

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
