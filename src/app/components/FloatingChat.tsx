// components/FloatingChat.tsx
import React, { useState, useEffect } from "react";
import ChatBox from "./ChatBox"; // use your existing ChatBox
type UserType = {
  _id: string;
  name: string;
  email: string;
  skills?: string[];
};

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserType | null>(null);
  const [chatWithUser, setChatWithUser] = useState<UserType | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) return;

    const user: UserType = JSON.parse(userString);
    setLoggedInUser(user);

    const token = localStorage.getItem("token") || "";
    fetch("http://localhost:5000/api/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((users: UserType[]) => {
        // pick the first user who is not the logged-in user
        const otherUser = users.find(u => u._id !== user._id) || users[0] || null;
        setChatWithUser(otherUser);
      })
      .catch(err => console.error(err));
  }, []);

  if (!loggedInUser || !chatWithUser) return null;

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50 }}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: "#0b93f6",
            color: "#fff",
            fontSize: 24,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          💬
        </button>
      )}

      {open && (
        <div style={{ position: "relative" }}>
          <ChatBox loggedInUser={loggedInUser} chatWithUser={chatWithUser} />
          <button
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: "#ff4d4d",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
