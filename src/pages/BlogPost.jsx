import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  /* ---------------- LOAD BLOGS ---------------- */
  useEffect(() => {
    api
      .get("/api/admin/blogs/fetch")
      .then((res) => setBlogs(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- ACTIONS ---------------- */
  const togglePublish = async (id) => {
    await api.patch(`/api/admin/blogs/${id}/publish`);
    setBlogs((prev) =>
      prev.map((b) =>
        b._id === id ? { ...b, isPublished: !b.isPublished } : b
      )
    );
  };

  const deleteBlog = async (id) => {
    if (!confirm("Delete this blog permanently?")) return;
    await api.delete(`/api/admin/blogs/${id}`);
    setBlogs((prev) => prev.filter((b) => b._id !== id));
  };

  /* ---------------- FILTER ---------------- */
  const filteredBlogs = blogs.filter((b) =>
    query
      ? b.title.toLowerCase().includes(query.toLowerCase())
      : true
  );

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading blogs…
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
          <p className="text-muted-foreground text-sm">
            Manage blog posts and publishing status
          </p>
        </div>

        <Link to="/admin/blogs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Blog
          </Button>
        </Link>
      </div>

      {/* TABLE CARD */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>All Blogs</CardTitle>

          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search blog title"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Read Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredBlogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell className="font-medium">
                    {blog.title}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={blog.isPublished ? "default" : "secondary"}
                    >
                      {blog.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {blog.readTime || "-"}
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublish(blog._id)}
                    >
                      {blog.isPublished ? "Unpublish" : "Publish"}
                    </Button>

                    <Link to={`/admin/blogs/edit/${blog._id}`}>
                      <Button size="sm" variant="ghost">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBlog(blog._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBlogs.length === 0 && (
            <>
              <Separator className="my-6" />
              <p className="text-center text-muted-foreground">
                No blogs found.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
