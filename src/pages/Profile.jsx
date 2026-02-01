import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { useAuth } from "../context/useAuth";
import imageCompression from "browser-image-compression";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const { admin, setAdmin } = useAuth();

  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const [preview, setPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  /* ---------------- LOAD ADMIN ---------------- */
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

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
    });

    setAvatarFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  };

  const uploadAvatar = async () => {
    const fd = new FormData();
    fd.append("image", avatarFile);

    const res = await api.post("/api/admin/upload", fd);
    return res.data.secure_url;
  };

  /* ---------------- SAVE PROFILE ---------------- */
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
      alert("Profile updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!admin) return <p className="p-6">Loading...</p>;

  /* ================= RENDER ================= */

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-500 mt-1">
          Update your account profile information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <p className="text-sm text-gray-500">
            Manage your personal details
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* AVATAR */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border bg-gray-100">
              <img
                src={preview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current.click()}
              >
                Change Photo
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
              <p className="text-xs text-gray-500 mt-1">
                JPG or PNG (max 1MB)
              </p>
            </div>
          </div>

          <Separator />

          {/* FORM */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Admin Name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <Button disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
