// src/context/AuthProvider.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import api from "../api";
import { AuthContext } from "./AuthContext";

function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    setToken("");
    setAdmin(null);
  }, []);

  const login = useCallback((adminData, jwt) => {
    if (!jwt) return;
    localStorage.setItem("adminToken", jwt);
    setToken(jwt);
    setAdmin(adminData || null);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setAdmin(null);
      return;
    }

    let isActive = true; // <-- React-18-safe flag

    const verify = async () => {
      setLoading(true);
      const url = "/api/admin/verify";
      console.debug("[AuthProvider] verify ->", { url });

      try {
        // use configured api instance (baseURL + interceptor will apply)
        const res = await api.get(url);

        if (!isActive || !mountedRef.current) return;

        console.debug("[AuthProvider] verify response:", {
          status: res?.status,
          url: res?.config?.url,
          data: res?.data,
        });

        // defensive: if backend returned HTML (index.html) it's probably a baseURL/proxy issue
        const isHtml = typeof res?.data === "string" && res.data.trim().startsWith("<");
        if (isHtml) {
          console.error("[AuthProvider] verify returned HTML. Check baseURL/proxy/server routing.");
          logout();
          return;
        }

        setAdmin(res?.data?.admin || null);
      } catch (err) {
        if (!isActive || !mountedRef.current) return;

        // ignore axios cancellation errors (shouldn't happen without AbortController)
        const canceled = err?.code === "ERR_CANCELED" || err?.name === "CanceledError";
        if (canceled) {
          console.info("[AuthProvider] verify canceled");
          return;
        }

        console.error("[AuthProvider] verify error:", {
          message: err?.message,
          code: err?.code,
          name: err?.name,
          responseStatus: err?.response?.status,
          responseData: err?.response?.data,
        });

        if (err?.response?.status === 401) {
          console.warn("[AuthProvider] token invalid/expired -> logout");
          logout();
          return;
        }

        // other unexpected errors — log out to be safe
        logout();
      } finally {
        if (isActive && mountedRef.current) setLoading(false);
      }
    };

    verify();

    return () => {
      // mark inactive so we don't set state after unmount
      isActive = false;
    };
  }, [token, logout]);

  const value = useMemo(
    () => ({
      admin,
      token,
      loading,
      login,
      logout,
    }),
    [admin, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
