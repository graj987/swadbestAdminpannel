import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    api.get(`/api/admin/blogs/${id}`).then(res => setForm(res.data));
  }, [id]);

  if (!form) return null;

  const update = async () => {
    await api.put(`/api/admin/blogs/${id}`, form);
    navigate("/admin/blogs");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Edit Blog</h1>

      <input
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        className="w-full border p-2"
      />

      <textarea
        value={form.content}
        onChange={e => setForm({ ...form, content: e.target.value })}
        className="w-full border p-2 h-60"
      />

      <button
        onClick={update}
        className="bg-orange-600 text-white px-6 py-2 rounded"
      >
        Update Blog
      </button>
    </div>
  );
};

export default EditBlog;
