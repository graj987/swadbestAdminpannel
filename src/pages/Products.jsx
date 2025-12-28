// src/pages/Products.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../api";

// Optional: if you installed browser-image-compression, uncomment the import and compression code below
import imageCompression from "browser-image-compression";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state (merged add-product behaviour)
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [file, setFile] = useState(null); // selected File
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");

  // keep a ref so we can guard against updates after unmount
  const isMountedRef = useRef(true);
  const inputRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // revoke object URL if created
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("adminToken");
    window.location.replace("/admin/login");
  }, []);

  const normalizeProducts = useCallback((raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.products)) return raw.products;
    return [];
  }, []);

  // fetch products
  const fetchProducts = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/product");
      if (!isMountedRef.current) return;
      const arr = normalizeProducts(res.data);
      setProducts(arr);
    } catch (err) {
      if (!isMountedRef.current) return;
      const canceled = err?.code === "ERR_CANCELED" || err?.name === "CanceledError";
      if (canceled) return;

      console.error("Product fetch error:", err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError("Failed to fetch products");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [normalizeProducts, handleAuthError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // FILE SELECTED (from AddProducts flow)
  const setErrAndReset = (msg) => {
    setError(msg);
    if (inputRef.current) inputRef.current.value = "";
    setFile(null);
    setPreviewUrl("");
  };

  const resetFile = () => {
    setFile(null);
    setPreviewUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileSelect = async (e) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return resetFile();

    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) return setErrAndReset("Only JPG/PNG/WebP/GIF allowed.");
    if (f.size > 10 * 1024 * 1024) return setErrAndReset("Image too large (max 10 MB).");

    try {
      const compressed = await imageCompression(f, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      const finalFile = compressed && compressed.size ? compressed : f;
      setFile(finalFile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(finalFile));
    } catch (err) {
     err
      setFile(f);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  // Upload file to your backend which will upload to Cloudinary (AddProducts flow)
  const uploadFileToServer = async (fileToUpload) => {
    const fd = new FormData();
    fd.append("file", fileToUpload); // must match upload.single("file") on server
    // optional: fd.append("folder", "products");

    const resp = await api.post("api/admin/upload", fd, {
      onUploadProgress: (evt) => {
        if (!evt.total) return;
        setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
      },
      timeout: 120000,
    });

    if (!resp?.data?.secure_url) throw new Error("Server upload failed");
    return resp.data; // { secure_url, public_id, ... }
  };

  const retry = async (fn, attempts = 3) => {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 300 * Math.pow(2, i)));
      }
    }
    throw lastErr;
  };

  // ADD PRODUCT: merged behavior from AddProducts.jsx
  const addProduct = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    if (!form.name || form.price === "") return setError("Name and price are required.");
    if (!file) return setError("Please select an image file.");

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadResp = await retry(() => uploadFileToServer(file), 3);

      const payload = {
        name: form.name,
        price: parseFloat(form.price) || 0,
        description: form.description || "",
        image: uploadResp.secure_url,
        publicId: uploadResp.public_id,
      };

      await api.post("api/admin/product", payload);
      setSuccess("Product added successfully.");
      setForm({ name: "", price: "", description: "" });
      resetFile();

      // refresh product list
      await fetchProducts();
    } catch (err) {
      console.error("Add product error:", err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError(err?.response?.data?.message || err?.message || "Failed to add product.");
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`api/admin/product/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete product error:", err);
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      alert("Failed to delete product");
    }
  };

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-4">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
        <p className="text-sm text-gray-500">Manage your catalogue — fast, responsive and accessible.</p>
      </header>

      {/* Add Product Form */}
      <form onSubmit={addProduct} className="mb-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 transition hover:shadow-md">
        <h2 className="text-lg font-semibold mb-4">Add Product</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />

            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1 mt-3">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              className="w-40 rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              step="0.01"
              min="0"
            />

            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 mt-3">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description for product listing"
              className="resize-none block w-full rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition h-24"
            />
          </div>

          {/* File input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="mt-3 w-full h-36 object-cover rounded-lg border border-gray-100 shadow-sm"
              />
            )}
          </div>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Uploading</span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div style={{ width: `${uploadProgress}%` }} className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading...
              </>
            ) : (
              'Add Product'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({ name: "", price: "", description: "" });
              resetFile();
              setError(null);
              setSuccess("");
            }}
            className="px-5 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mt-3 text-sm text-green-600">{success}</div>}
      </form>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 && (
          <p className="text-gray-600 col-span-full text-center">No products found.</p>
        )}

        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-sm rounded-2xl p-4 border border-gray-100 hover:shadow-md transition overflow-hidden"
          >
            <div className="relative h-44 bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={product.image || "/placeholder.png"}
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                alt={product.name || "Product image"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg">{product.name}</h2>
                {product.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>}
              </div>

              <div className="text-right">
                <div className="text-gray-500 text-sm">Price</div>
                <div className="font-bold text-lg">₹{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            <button
              onClick={() => deleteProduct(product._id)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
