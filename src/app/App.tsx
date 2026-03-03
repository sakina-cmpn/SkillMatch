import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { useEffect } from "react";
import {socket} from "../socket";
import { toast } from "sonner";

export default function App() {

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // 🔥 JOIN ROOM
    if (user?._id) {
      socket.emit("join", user._id);
      console.log("Joined room:", user._id);
    }

    // 🔥 LISTEN FOR REQUEST
    socket.on("newRequest", (data: { message: string }) => {
      toast.success(data.message);
    });

    return () => {
      socket.off("newRequest");
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" closeButton duration={4000} />
    </>
  );
}