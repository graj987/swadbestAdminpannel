// src/pages/AddProducts.jsx
import React, { useState, useRef, useEffect } from "react";
import api from "../api";

export default function AddProducts() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onFileChange = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({ name: "", price: "", description: "" });
    setImageFile(null);
    setPreview("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.price) {
      setError("Name and price are required");
      return;
    }

    if (!imageFile) {
      setError("Product image is required");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", Number(form.price));
    fd.append("description", form.description);
    fd.append("image", imageFile); // MUST match upload.single("image")

    try {
      setLoading(true);
      await api.post("/api/admin/product", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Product added successfully");
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded">
          {success}
        </div>
      )}

      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-2xl shadow border space-y-4"
      >
        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={onChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={onChange}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={onChange}
          rows={3}
          className="w-full border p-3 rounded"
        />

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="w-full border-2 border-dashed p-4 rounded hover:bg-gray-50"
          >
            Click to upload image
          </button>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 h-48 w-full object-cover rounded border"
            />
          )}
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
