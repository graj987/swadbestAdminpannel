import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import imageCompression from "browser-image-compression";

import { Image as ImageIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";

/* ================================================= */

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Other",
    weight: "",
    price: "",
    stock: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD PRODUCT ================= */

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/admin/products/${id}`);
        const p = res.data;
        const v = p.variants?.[0]; // backend constraint

        setForm({
          name: p.name || "",
          description: p.description || "",
          category: p.category || "Other",
          weight: v?.weight || "",
          price: v?.price || "",
          stock: v?.stock || "",
        });

        setPreview(p.image);
      } catch (err) {
        setError("Failed to load product",err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ================= HANDLERS ================= */

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

  /* ================= SAVE ================= */

  const saveProduct = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Product name is required");
    if (!form.weight.trim()) return setError("Variant weight is required");

    try {
      setSaving(true);

      let imageUrl = preview;
      if (file) imageUrl = await uploadImage();

      await api.put(`/api/admin/products/${id}`, {
        name: form.name,
        description: form.description,
        category: form.category,
        image: imageUrl,

        // variant update (index 0 only)
        variantIndex: 0,
        weight: form.weight,
        price: Number(form.price),
        stock: Number(form.stock),
      });

      navigate("/admin/product");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading product…
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Update Product</h1>
        <p className="text-muted-foreground mt-1">
          Edit product details and inventory
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={saveProduct}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, category: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                    <SelectItem value="Meal">Meal</SelectItem>
                    <SelectItem value="Sweets">Sweets</SelectItem>
                    <SelectItem value="Pickles">Pickles</SelectItem>
                    <SelectItem value="Drinks">Drinks</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* VARIANT */}
          <Card>
            <CardHeader>
              <CardTitle>Variant (Primary)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Weight (e.g. 250 g)"
                name="weight"
                value={form.weight}
                onChange={handleChange}
              />
              <Input
                type="number"
                placeholder="Price (₹)"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
              <Input
                type="number"
                placeholder="Stock"
                name="stock"
                value={form.stock}
                onChange={handleChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer border-2 border-dashed rounded-xl p-4 text-center hover:border-primary transition"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-6 h-6" />
                    <p>Click to upload image</p>
                  </div>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFile}
              />
            </CardContent>
          </Card>

          <Button
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? "Saving..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
