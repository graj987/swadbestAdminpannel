// src/context/useAuth.js
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Named export only — avoid default to keep imports explicit.
 * Throws if used outside <AuthProvider>.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
