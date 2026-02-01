import React, { useState, useRef, useEffect } from "react";
import api from "../api";

import { Plus, Image as ImageIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ================================================= */

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

  const uploadRef = useRef(null);

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  /* ---------------- HANDLERS ---------------- */

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
      return setError("Only image files are allowed");

    if (f.size > 2 * 1024 * 1024)
      return setError("Image must be below 2MB");

    setError("");
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
    if (uploadRef.current) uploadRef.current.value = "";
  };

  /* ---------------- SUBMIT ---------------- */

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

    // backend expects single variant
    fd.append("weight", firstVariant.weight);
    fd.append("price", Number(firstVariant.price));
    fd.append("stock", Number(firstVariant.stock));
    fd.append("image", imageFile);

    try {
      setLoading(true);
      await api.post("/api/admin/products", fd);
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
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Add Product</h1>
        <p className="text-muted-foreground mt-1">
          Create and publish a new product
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  name="description"
                  placeholder="Product description"
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

          {/* VARIANTS */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="Weight (e.g. 250 g)"
                    value={v.weight}
                    onChange={(e) =>
                      updateVariant(i, "weight", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Price (₹)"
                    value={v.price}
                    onChange={(e) =>
                      updateVariant(i, "price", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) =>
                      updateVariant(i, "stock", e.target.value)
                    }
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-fit"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant (future use)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* IMAGE */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => uploadRef.current?.click()}
                className="cursor-pointer border-2 border-dashed rounded-xl p-4 text-center hover:border-primary transition"
              >
                {!preview ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-6 h-6" />
                    <p>Click to upload image</p>
                    <span className="text-xs">Max 2MB</span>
                  </div>
                ) : (
                  <img
                    src={preview}
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
                onChange={handleFile}
              />
            </CardContent>
          </Card>

          {/* ACTION */}
          <Button disabled={loading} className="w-full" size="lg">
            {loading ? "Saving..." : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
