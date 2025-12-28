// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const extractTokenAndUser = (data) => {
    // Accept many shapes:
    // 1) { token: "...", admin: { ... } }
    // 2) { accessToken: "...", user: {...} }
    // 3) { token: "...", user: {...} }
    // 4) raw token string -> data is string
    // 5) token + user fields at same level -> { _id, name, email, token }
    if (!data) return { token: null, user: null };

    if (typeof data === "string") {
      return { token: data, user: null };
    }

    // direct token fields
    const token = data.token || data.accessToken || data.access_token || null;

    // possible user containers
    let user = data.admin || data.user || data.data || null;

    // handle case: token + user fields at same level (your sample)
    const hasUserFieldsAtRoot = (data._id || data.id || data.email || data.name) && token;
    if (!user && hasUserFieldsAtRoot) {
      // create a user object copying everything except token-like fields
      const { token: _t, accessToken: _a, access_token: _aa, ...rest } = data;
      user = Object.keys(rest).length ? rest : null;
    }

    return { token, user };
  };

  const looksLikeJwt = (t) => typeof t === "string" && t.split(".").length === 3;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Email and password are required.");
    setLoading(true);

    try {
      const res = await api.post("/api/admin/login", form);

      const { token, user } = extractTokenAndUser(res?.data);

      // fallback deeper checks if needed
      if (!token || !looksLikeJwt(token)) {
        const alt = res?.data?.data ?? res?.data?.result ?? null;
        const altExtract = extractTokenAndUser(alt);
        if (!altExtract.token || !looksLikeJwt(altExtract.token)) {
          throw new Error("No valid token returned from server");
        }
        // use fallback
        localStorage.setItem("adminToken", altExtract.token);
        localStorage.setItem("adminUser", JSON.stringify(altExtract.user || {}));
        login(altExtract.user || null, altExtract.token);
        navigate("/admin/dashboard");
        return;
      }

      // persist for reloads / non-context consumers
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user || {}));

      login(user || null, token);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      const serverMessage = err?.response?.data?.message ?? err?.response?.data ?? null;
      const msg = serverMessage || err?.message || "Login failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
        {error && <div className="bg-red-50 text-red-700 p-2 rounded mb-4">{error}</div>}

        <form onSubmit={submit}>
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="w-full border p-2 rounded mb-4"
            placeholder="admin@example.com"
            required
          />

          <label className="block mb-2 text-sm font-medium">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            className="w-full border p-2 rounded mb-4"
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            className="w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
