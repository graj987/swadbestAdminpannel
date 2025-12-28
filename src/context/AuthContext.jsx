// src/context/AuthContext.js
import { createContext } from "react";

// Use null so useContext can check for null (clearer intent)
export const AuthContext = createContext(null);
