import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import AdminEditor from "../components/AdminEditor";

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";

import { ImagePlus, Eye } from "lucide-react";

export default function AddBlog() {
  const navigate = useNavigate();
  const uploadRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    readTime: "3 min read",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => imagePreview && URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.excerpt.trim()) return "Excerpt is required";
    if (!form.content.trim()) return "Content is required";
    if (!imageFile) return "Featured image is required";
    return null;
  };

  /* ---------------- IMAGE ---------------- */
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setError("Only image files allowed");
    }

    if (file.size > 2 * 1024 * 1024) {
      return setError("Image must be under 2MB");
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* ---------------- SUBMIT ---------------- */
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

      await api.post("/api/admin/blogs/add", fd);
      navigate("/admin/blogs");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Create Blog</h1>
        <p className="text-muted-foreground">
          Write and publish a new blog post
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONTENT */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            placeholder="Blog title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="text-lg h-12"
          />

          <textarea
            placeholder="Short excerpt (SEO + cards)"
            className="w-full border rounded-lg p-4 h-28 resize-none bg-background"
            value={form.excerpt}
            onChange={(e) =>
              setForm({ ...form, excerpt: e.target.value })
            }
          />

          <Card>
            <CardContent className="p-0">
              <AdminEditor
                value={form.content}
                onChange={(html) =>
                  setForm({ ...form, content: html })
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* SETTINGS */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* IMAGE */}
              <div
                onClick={() => uploadRef.current?.click()}
                className="cursor-pointer border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition"
              >
                {!imagePreview ? (
                  <div className="space-y-2 text-muted-foreground">
                    <ImagePlus className="mx-auto" />
                    <p>Upload featured image</p>
                    <p className="text-xs">Max 2MB</p>
                  </div>
                ) : (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md"
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

              <Input
                placeholder="Read time (e.g. 5 min read)"
                value={form.readTime}
                onChange={(e) =>
                  setForm({ ...form, readTime: e.target.value })
                }
              />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? "Hide Preview" : "Preview Blog"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PREVIEW */}
      {previewMode && (
        <Card>
          <CardContent className="p-6">
            {imagePreview && (
              <img
                src={imagePreview}
                className="w-full h-72 object-cover rounded-xl mb-4"
                alt="Preview"
              />
            )}
            <h2 className="text-3xl font-bold mb-2">{form.title}</h2>
            <Badge variant="secondary" className="mb-4">
              {form.readTime}
            </Badge>
            <p className="text-muted-foreground mb-4">
              {form.excerpt}
            </p>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: form.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* ACTION BAR */}
      <div className="sticky bottom-0 bg-background border-t py-4 flex justify-end gap-4">
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => submit("draft")}
        >
          Save Draft
        </Button>

        <Button
          disabled={loading}
          onClick={() => submit("published")}
        >
          {loading ? "Publishing..." : "Publish Blog"}
        </Button>
      </div>
    </div>
  );
}
