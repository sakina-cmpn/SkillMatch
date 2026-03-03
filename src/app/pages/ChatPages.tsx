// src/pages/ChatPage.tsx
import { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import { API_BASE_URL } from "../../config/api";

type UserType = {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
};

const ChatPage: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState<UserType | null>(null);
    const [chatWithUser, setChatWithUser] = useState<UserType | null>(null);

    useEffect(() => {
        // Safe localStorage parsing
        const userString = localStorage.getItem("user");
        if (!userString) return; // redirect to login if not found
        const user: UserType = JSON.parse(userString);
        setLoggedInUser(user);

        // Fetch other users
        const token = localStorage.getItem("token") || "";
        fetch(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => res.json())
            .then((users: UserType[]) => {
                // Pick the first user that's not the logged-in user
                const otherUser = users.find((u) => u._id !== user._id) || null;
                setChatWithUser(otherUser);
            })
            .catch((err) => console.error(err));
    }, []);

    if (!loggedInUser || !chatWithUser) return <div>Loading chat...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>
                Chatting with <strong>{chatWithUser.name}</strong>
            </h2>
            <ChatBox loggedInUser={loggedInUser} chatWithUser={chatWithUser} />
        </div>
    );
};

export default ChatPage;
