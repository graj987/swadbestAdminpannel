// src/api.js
import axios from "axios";

const getBaseURL = () => {
  // Vite environment (recommended for Vite)
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // CRA / Node-style env: access process via globalThis to avoid ESLint `no-undef`
  if (
    typeof globalThis !== "undefined" &&
    globalThis.process &&
    globalThis.process.env &&
    globalThis.process.env.REACT_APP_API_BASE_URL
  ) {
    return globalThis.process.env.REACT_APP_API_BASE_URL;
  }

  // fallback
  return "https://swadbackendserver.onrender.com";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      // ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      // method can be undefined, so guard with optional chaining
      const method = config.method ? config.method.toUpperCase() : "UNKNOWN";
      const url = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
      console.debug("[api] req ->", method, url, config.headers);
    } catch (e) {
   e
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => {
    try {
      console.debug("[api] res <-", res.status, res.config?.url, res.data);
    } catch (e) {
      e
    }
    return res;
  },
  (err) => {
    console.error(
      "[api] err <-",
      err?.message,
      err?.response?.status,
      err?.config?.url,
      err?.response?.data
    );
    return Promise.reject(err);
  }
);

export default api;
