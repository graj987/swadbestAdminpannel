import React, { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/useAuth";
import imageCompression from "browser-image-compression";

export default function Profile() {
  const { admin, setAdmin } = useAuth();

  const [saving, setSaving] = useState(false);

  const [preview, setPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Load admin data
  useEffect(() => {
    if (admin) {
      setForm({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        password: "",
      });
      setPreview(admin.avatar || "/default-avatar.png");
    }
  }, [admin]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /** Handle avatar image selection */
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // compress before upload
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
    });

    setAvatarFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  };

  /** Upload avatar to Cloudinary */
  const uploadAvatar = async () => {
    const fd = new FormData();
    fd.append("image", avatarFile);

    const res = await api.post("/api/admin/upload", fd);
    return res.data.secure_url;
  };

  /** Save updated profile */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let avatarUrl = preview;

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const res = await api.put("/api/admin/update-profile", {
        ...form,
        avatar: avatarUrl,
      });

      

      setAdmin(res.data.admin);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile");
     
    } finally {
      setSaving(false);
    }
  };

  if (!admin) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-white p-6 rounded-xl shadow border">

        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <img
            src={preview}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />

          <div>
            <label className="cursor-pointer text-blue-600 font-medium">
              Change Avatar
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG (max 1 MB)
            </p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Admin Name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>

          <div>
            <label className="text-sm font-medium">New Password</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave empty to keep old password"
            />
          </div>

          <button
            disabled={saving}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg w-full hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
