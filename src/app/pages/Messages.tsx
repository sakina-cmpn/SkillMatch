import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import axios from "axios";
import { socket } from "../../socket";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import {
  Paperclip,
  SendHorizonal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

type ChatMessage = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt?: string;
  attachment?: {
    name?: string;
    type?: string;
    dataUrl?: string;
  };
};

type ChatUser = {
  _id: string;
  name: string;
  email?: string;
  photoUrl?: string;
};

type TeamRequest = {
  fromUserId: { _id: string; name: string };
  toUserId: { _id: string; name: string };
  status: "pending" | "accepted" | "declined";
};

export default function Messages() {
  const { id } = useParams(); // receiverId

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [text, setText] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<{
    name: string;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [isReadingAttachment, setIsReadingAttachment] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const { user, token } = useAuth();
  const currentUserId = user?._id;
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  /* ============================
     🔹 JOIN SOCKET ROOM
  ============================ */
  useEffect(() => {
    if (currentUserId) {
      socket.emit("join", currentUserId);
    }
  }, [currentUserId]);

  /* ============================
     🔹 Fetch Messages
  ============================ */
  const fetchMessages = async () => {
    if (!id || !token) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchMessages();
    }
  }, [id, token]);

  /* ============================
     🔹 Fetch Users for Sidebar
  ============================ */
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data || []);
      } catch (err) {
        console.error("Users fetch error:", err);
      }
    };
    fetchUsers();
  }, [token]);

  /* ============================
     🔹 Allow Chat Only If Accepted
  ============================ */
  useEffect(() => {
    const checkPermission = async () => {
      if (!token || !currentUserId || !id) {
        setCanMessage(false);
        setCheckingPermission(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const accepted = (res.data as TeamRequest[]).some((req) => {
          if (req.status !== "accepted") return false;
          const isPairA =
            req.fromUserId?._id === currentUserId && req.toUserId?._id === id;
          const isPairB =
            req.fromUserId?._id === id && req.toUserId?._id === currentUserId;
          return isPairA || isPairB;
        });

        setCanMessage(accepted);
      } catch (err) {
        console.error("Permission check error:", err);
        setCanMessage(false);
      } finally {
        setCheckingPermission(false);
      }
    };
    checkPermission();
  }, [token, currentUserId, id]);

  /* ============================
     🔹 Listen for Real-time Messages
  ============================ */
  useEffect(() => {
    if (!id || !currentUserId) return;

    const handleReceiveMessage = (newMessage: ChatMessage) => {
      if (
        (newMessage.senderId === id && newMessage.receiverId === currentUserId) ||
        (newMessage.senderId === currentUserId && newMessage.receiverId === id)
      ) {
        setMessages((prev) =>
          prev.some((m) => m._id === newMessage._id) ? prev : [...prev, newMessage]
        );
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [id, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ============================
     🔹 Send Message
  ============================ */
  const handleSend = async () => {
    if (isReadingAttachment) {
      alert("Please wait, attachment is still loading.");
      return;
    }
    if ((!text.trim() && !selectedAttachment) || !id || !token || !canMessage) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/messages/send`,
        {
          receiverId: id,
          text,
          attachment: selectedAttachment || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdMessage = res?.data as ChatMessage;
      if (createdMessage?._id) {
        setMessages((prev) =>
          prev.some((m) => m._id === createdMessage._id) ? prev : [...prev, createdMessage]
        );
      }

      setText("");
      setSelectedAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Send error:", err);
      alert(err?.response?.data?.error || "Failed to send attachment/message");
    }
  };

  const handleSelectAttachment = (file?: File) => {
    if (!file) return;
    const maxSizeBytes = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSizeBytes) {
      alert("File too large. Please select a file smaller than 8MB.");
      return;
    }
    setIsReadingAttachment(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAttachment({
        name: file.name,
        type: file.type,
        dataUrl: String(reader.result || ""),
      });
      setIsReadingAttachment(false);
    };
    reader.onerror = () => {
      setIsReadingAttachment(false);
      alert("Could not read the selected file.");
    };
    reader.readAsDataURL(file);
  };

  const activeUser = useMemo(
    () => users.find((u) => u._id === id) || null,
    [users, id]
  );

  const formatTime = (date?: string) => {
    if (!date) return "Now";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="relative min-h-[calc(100vh-130px)] rounded-3xl bg-gradient-to-br from-[#F8FAFC] to-[#FFFFFF] p-3 sm:p-4 lg:p-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(193,232,255,0.28),_transparent_55%)]" />


      <div className="relative z-10 mt-12 min-h-[76vh]">
        <section className="mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col rounded-3xl border border-[#E2E8F0] bg-white shadow-xl shadow-[#052659]/5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-[#C1E8FF]/70">
                <AvatarImage src={activeUser?.photoUrl || ""} />
                <AvatarFallback className="bg-[#E2E8F0] text-[#052659]">
                  {getInitials(activeUser?.name || "Teammate")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#052659]">
                  {activeUser?.name || "Select a conversation"}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B]">Active now</p>
              </div>
            </div>
            <Button className="bg-[#5483B3] hover:bg-[#46729f] text-white rounded-xl shadow-md shadow-[#5483B3]/25 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C1E8FF]/60">
              Invite to Team
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-[#F8FAFC] to-white px-4 py-5 sm:px-6">
            {!checkingPermission && !canMessage && (
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-sm text-[#475569]">
                You can message only users who accepted your team request.
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%] sm:max-w-[72%]">
                    <div
                      className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isMine
                          ? "bg-[#5483B3] text-white rounded-br-md"
                          : "bg-[#E2E8F0] text-[#052659] rounded-bl-md"
                      }`}
                    >
                      {msg.text && <p>{msg.text}</p>}
                      {msg.attachment?.dataUrl && (
                        <div className={`${msg.text ? "mt-2" : ""}`}>
                          {msg.attachment.type?.startsWith("image/") ? (
                            <a
                              href={msg.attachment.dataUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={msg.attachment.dataUrl}
                                alt={msg.attachment.name || "Attachment"}
                                className="max-h-56 rounded-xl border border-[#C1E8FF]/40"
                              />
                            </a>
                          ) : (
                            <a
                              href={msg.attachment.dataUrl}
                              download={msg.attachment.name || "attachment"}
                              className={`inline-block rounded-lg px-3 py-2 text-xs underline ${
                                isMine ? "bg-white/20 text-white" : "bg-white text-[#052659]"
                              }`}
                            >
                              {msg.attachment.name || "Download attachment"}
                            </a>
                          )}
                        </div>
                      )}
                      <span
                        className={`absolute top-full mt-0.5 h-2 w-2 rotate-45 ${
                          isMine
                            ? "right-2 bg-[#5483B3]"
                            : "left-2 bg-[#E2E8F0]"
                        } sm:hidden`}
                      />
                    </div>
                    <p
                      className={`mt-1 text-[11px] text-[#64748B]/80 ${
                        isMine ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-[#E2E8F0] bg-white/85 backdrop-blur-xl p-3 sm:p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-sm">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleSelectAttachment(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isReadingAttachment}
                className="rounded-xl p-2 text-[#64748B] transition-all hover:bg-[#C1E8FF]/30 hover:text-[#052659]"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={1}
                placeholder="Type your message..."
                className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#052659] outline-none placeholder:text-[#64748B]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <Button
                onClick={handleSend}
                disabled={!canMessage || checkingPermission || isReadingAttachment}
                className="h-11 rounded-xl bg-[#5483B3] px-5 text-white shadow-md shadow-[#5483B3]/25 transition-all hover:scale-[1.03] hover:bg-[#46729f] hover:shadow-lg hover:shadow-[#C1E8FF]/60"
              >
                <SendHorizonal className="mr-2 h-4 w-4" />
                {checkingPermission ? "Checking..." : isReadingAttachment ? "Preparing file..." : "Send"}
              </Button>
            </div>
            {isReadingAttachment && (
              <div className="mt-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#475569]">
                Preparing attachment...
              </div>
            )}
            {selectedAttachment && (
              <div className="mt-2 flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#475569]">
                <span className="truncate pr-3">Attached: {selectedAttachment.name}</span>
                <button
                  onClick={() => {
                    setSelectedAttachment(null);
                    setIsReadingAttachment(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-[#5483B3] hover:text-[#052659]"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
