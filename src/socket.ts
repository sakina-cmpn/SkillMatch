
export default socket;// socket.ts
import { io } from "socket.io-client";

// Use environment variable for production (set in Vercel dashboard)
// Fallback to localhost only for local development
const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
  withCredentials: true, // important if using auth/cookies
});

// Optional: Log connection status (good for debugging)
socket.on("connect", () => {
  console.log("Socket connected to:", SOCKET_URL);
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;
