import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import imageCompression from "browser-image-compression";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [open, setOpen] = useState(false);

  // Form
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "Other",
    stock: 1,
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileRef = useRef(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/products");
      setProducts(res.data || []);
    } catch (err) {
      setError("Failed to load products",err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      return setError("Only image files allowed.");
    }

    const compressed = await imageCompression(f, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
    });

    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  };

  const resetUpload = () => {
    setFile(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadToServer = async () => {
    const fd = new FormData();
    fd.append("image", file);

    const res = await api.post("/api/admin/upload", fd, {
      onUploadProgress: (evt) => {
        if (evt.total) {
          setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });

    return res.data.secure_url;
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) return setError("Product name required");
    if (!form.price) return setError("Price required");
    if (!file) return setError("Product image required");

    try {
      setUploading(true);

      const imageUrl = await uploadToServer();

      await api.post("/api/admin/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        image: imageUrl,
      });

      setSuccess("Product added successfully");
      setOpen(false);
      setForm({
        name: "",
        price: "",
        description: "",
        category: "Other",
        stock: 1,
      });
      resetUpload();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      await api.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError("Failed to delete product",err);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">Products</h1>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      {/* PRODUCT GRID */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white border rounded-xl shadow hover:shadow-lg p-4 transition"
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-40 object-cover rounded-lg"
            />

            <h3 className="mt-3 font-semibold text-lg">{p.name}</h3>

            <p className="text-sm text-gray-500 line-clamp-2">
              {p.description}
            </p>

            <div className="mt-3 flex justify-between items-center">
              <span className="font-bold text-green-600">₹{p.price}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/products/${p._id}`)}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(p._id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD PRODUCT MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Product</h2>

            <form onSubmit={submitProduct} className="space-y-4">
              <input
                className="w-full border p-3 rounded-lg"
                name="name"
                placeholder="Product name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                className="w-full border p-3 rounded-lg"
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
              />

              <textarea
                className="w-full border p-3 rounded-lg"
                name="description"
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={handleChange}
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              >
                <option>Snacks</option>
                <option>Meal</option>
                <option>Sweets</option>
                <option>Pickles</option>
                <option>Drinks</option>
                <option>Other</option>
              </select>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
                min="0"
              />

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="block w-full"
              />

              {preview && (
                <img
                  src={preview}
                  className="w-full h-40 object-cover rounded-lg mt-3"
                />
              )}

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetUpload();
                    setOpen(false);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {uploading ? "Uploading..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
