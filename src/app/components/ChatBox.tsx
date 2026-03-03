// src/components/ChatBox.tsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { socket } from "../../socket";

// ---------------------- TYPES ----------------------
type UserType = {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
};

type MessageType = {
    _id: string;
    senderId: string;
    receiverId: string;
    text: string;
    createdAt?: string;
};

interface ChatBoxProps {
    loggedInUser: UserType;
    chatWithUser: UserType;
}

// ---------------------- COMPONENT ----------------------
const ChatBox: React.FC<ChatBoxProps> = ({ loggedInUser, chatWithUser }) => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // ---------------------- AUTO SCROLL ----------------------
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ---------------------- FETCH & SOCKET LISTENER ----------------------
    useEffect(() => {
        if (!loggedInUser?._id || !chatWithUser?._id) return;

        // Join user room
        socket.emit("join", loggedInUser._id);

        // Fetch previous messages
        const token = localStorage.getItem("token") || "";
        axios
            .get(`http://localhost:5000/api/messages/${chatWithUser._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setMessages(res.data))
            .catch((err) => console.error(err));

        // Listen for new messages
        const handleNewMessage = (msg: MessageType) => {
            if (
                (msg.senderId === loggedInUser._id && msg.receiverId === chatWithUser._id) ||
                (msg.senderId === chatWithUser._id && msg.receiverId === loggedInUser._id)
            ) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on("receiveMessage", handleNewMessage);

        // Cleanup listener on unmount or user change
        return () => {
            socket.off("receiveMessage", handleNewMessage);
        };
    }, [loggedInUser, chatWithUser]);

    // ---------------------- SEND MESSAGE ----------------------
    const sendMessage = async () => {
        if (!input.trim()) return;

        try {
            const token = localStorage.getItem("token") || "";
            await axios.post(
                "http://localhost:5000/api/messages/send",
                {
                    receiverId: chatWithUser._id,
                    text: input,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setInput(""); // clear input
        } catch (err) {
            console.error("Send message failed:", err);
        }
    };

    // ---------------------- RENDER ----------------------
    return (
        <div
            style={{
                width: "400px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                height: "500px",
            }}
        >
            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        style={{
                            textAlign: msg.senderId === loggedInUser._id ? "right" : "left",
                            margin: "5px 0",
                        }}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                padding: "8px 12px",
                                borderRadius: "20px",
                                backgroundColor:
                                    msg.senderId === loggedInUser._id ? "#0b93f6" : "#e5e5ea",
                                color: msg.senderId === loggedInUser._id ? "#fff" : "#000",
                            }}
                        >
                            {msg.text}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ display: "flex", marginTop: "10px" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "20px",
                        border: "1px solid #ccc",
                    }}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        marginLeft: "5px",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "none",
                        backgroundColor: "#0b93f6",
                        color: "#fff",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
