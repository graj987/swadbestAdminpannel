import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/admin/blogs/fetch")
      .then(res => setBlogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (id) => {
    await api.patch(`/api/admin/blogs/${id}/publish`);
    setBlogs(prev =>
      prev.map(b =>
        b._id === id ? { ...b, isPublished: !b.isPublished } : b
      )
    );
  };

  const deleteBlog = async (id) => {
    const ok = window.confirm("Delete this blog permanently?");
    if (!ok) return;

    await api.delete(`/api/admin/blogs/${id}`);
    setBlogs(prev => prev.filter(b => b._id !== id));
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading blogs…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <Link
          to="/admin/blogs/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Blog
        </Link>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {blogs.map(blog => (
          <div
            key={blog._id}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border rounded-xl p-4 bg-white"
          >
            {/* LEFT */}
            <div>
              <p className="font-semibold text-lg">
                {blog.title}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    blog.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {blog.isPublished ? "Published" : "Draft"}
                </span>

                {blog.readTime && (
                  <span className="text-xs text-gray-400">
                    • {blog.readTime}
                  </span>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => togglePublish(blog._id)}
                className="px-3 py-1 border rounded-lg text-sm"
              >
                {blog.isPublished ? "Unpublish" : "Publish"}
              </button>

              <Link
                to={`/admin/blogs/edit/${blog._id}`}
                className="px-3 py-1 border rounded-lg text-sm"
              >
                Edit
              </Link>

              <button
                onClick={() => deleteBlog(blog._id)}
                className="px-3 py-1 border rounded-lg text-sm text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {blogs.length === 0 && (
          <p className="text-center text-gray-500">
            No blogs found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;
