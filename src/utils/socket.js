import { io } from "socket.io-client";

/**
 * Socket instance (DO NOT auto-connect)
 */
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  autoConnect: false,          // 🔒 important
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

/**
 * Connect admin socket with auth token
 */
export const connectAdminSocket = (token) => {
  if (!token) {
    console.warn("⚠️ Socket connection blocked: No token");
    return;
  }

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
    console.log("🟢 Admin socket connected");
  }
};

/**
 * Disconnect socket cleanly
 */
export const disconnectAdminSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("🔴 Admin socket disconnected");
  }
};

export default socket;
