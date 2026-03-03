import { io } from "socket.io-client";
import { API_BASE_URL } from "./config/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
  withCredentials: true,
});

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
