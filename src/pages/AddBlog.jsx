import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import AdminEditor from "../components/AdminEditor";

export default function AddBlog() {
  const navigate = useNavigate();
  const uploadRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    readTime: "3 min read",
    status: "draft",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState("");

  /* cleanup preview URL */
  useEffect(() => {
    return () => imagePreview && URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  /* ================= VALIDATION ================= */

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.excerpt.trim()) return "Excerpt is required";
    if (!form.content.trim()) return "Content is required";
    if (!imageFile) return "Featured image is required";
    return null;
  };

  /* ================= IMAGE HANDLER ================= */

  const handleImage = (e) => {
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

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* ================= SUBMIT ================= */

  const submit = async (status) => {
    setError("");
    const err = validate();
    if (err) return setError(err);

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("excerpt", form.excerpt);
      fd.append("content", form.content);
      fd.append("readTime", form.readTime);
      fd.append("status", status);
      fd.append("image", imageFile);

      // ❗ DO NOT SET Content-Type manually
      await api.post("/api/admin/blogs/add", fd);

      navigate("/admin/blogs");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Blog</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE – CONTENT */}
        <div className="lg:col-span-2 space-y-4">
          <input
            placeholder="Blog title"
            className="w-full border rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <textarea
            placeholder="Short excerpt (shown on blog cards & SEO)"
            className="w-full border rounded-xl p-4 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.excerpt}
            onChange={(e) =>
              setForm({ ...form, excerpt: e.target.value })
            }
          />

          <div className="border rounded-xl overflow-hidden bg-white">
            <AdminEditor
              value={form.content}
              onChange={(html) =>
                setForm({ ...form, content: html })
              }
            />
          </div>
        </div>

        {/* RIGHT SIDE – SETTINGS */}
        <div className="space-y-4">
          <div className="border rounded-xl p-4 bg-white space-y-4">
            <h3 className="font-semibold text-lg">Blog Settings</h3>

            {/* IMAGE UPLOAD CARD */}
            <div
              onClick={() => uploadRef.current?.click()}
              className="cursor-pointer border-2 border-dashed rounded-xl p-4 text-center hover:border-orange-500 transition"
            >
              {!imagePreview ? (
                <p className="text-gray-500">
                  Click to upload featured image<br />
                  <span className="text-sm">(Max 2MB)</span>
                </p>
              ) : (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>

            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImage}
            />

            <input
              placeholder="Read time (e.g. 5 min read)"
              className="w-full border rounded-lg p-2"
              value={form.readTime}
              onChange={(e) =>
                setForm({ ...form, readTime: e.target.value })
              }
            />

            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="w-full border rounded-lg py-2 hover:bg-gray-50"
            >
              {previewMode ? "Hide Preview" : "Preview Blog"}
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW MODE */}
      {previewMode && (
        <div className="mt-10 border rounded-2xl bg-gray-50 p-6">
          {imagePreview && (
            <img
              src={imagePreview}
              className="w-full h-72 object-cover rounded-xl mb-4"
              alt="Preview"
            />
          )}
          <h2 className="text-3xl font-bold mb-2">{form.title}</h2>
          <p className="text-gray-600 mb-4">{form.excerpt}</p>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: form.content }}
          />
        </div>
      )}

      {/* ACTION BAR */}
      <div className="mt-10 flex justify-end gap-4 sticky bottom-0 bg-white py-4">
        <button
          disabled={loading}
          onClick={() => submit("draft")}
          className="border px-6 py-2 rounded-lg"
        >
          Save Draft
        </button>

        <button
          disabled={loading}
          onClick={() => submit("published")}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Publishing..." : "Publish Blog"}
        </button>
      </div>
    </div>
  );
}
