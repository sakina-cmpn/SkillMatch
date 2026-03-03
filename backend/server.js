// server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const JWT_SECRET = process.env.JWT_SECRET || "skillmatch-dev-secret";
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
let isDatabaseReady = false;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
]
  .filter(Boolean)
  .flatMap((origin) => String(origin).split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(
      origin || ""
    );
    if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

/* ================================
   ✅ MIDDLEWARE
================================ */
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

/* ================================
   ✅ MongoDB Connection
================================ */
mongoose
  .connect(MONGO_URI || "mongodb://127.0.0.1:27017/skillmatch", {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    isDatabaseReady = true;
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    isDatabaseReady = false;
    console.log("❌ MongoDB Error:", err?.message || err);
  });

mongoose.connection.on("connected", () => {
  isDatabaseReady = true;
});

mongoose.connection.on("disconnected", () => {
  isDatabaseReady = false;
});

app.use("/api", (req, res, next) => {
  if (!isDatabaseReady) {
    return res.status(503).json({
      error: "Database unavailable. Configure MONGO_URI or MONGODB_URI on backend.",
    });
  }
  return next();
});

/* ================================
   ✅ Schemas
================================ */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'SkillMatch Backend API is live 🚀',
    status: 'online',
    version: '1.0.0'
  });
});
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: [String],
  semester: { type: String, default: "" },
  department: { type: String, default: "" },
  githubUrl: { type: String, default: "" },
  hackathonsParticipated: { type: Number, default: 0 },
  photoUrl: { type: String, default: "" },
  projects: [
    {
      title: { type: String, required: true },
      description: { type: String, default: "" },
      techStack: { type: [String], default: [] },
      files: {
        type: [
          {
            name: { type: String, default: "" },
            type: { type: String, default: "" },
            size: { type: Number, default: 0 },
            dataUrl: { type: String, default: "" },
          },
        ],
        default: [],
      },
      link: { type: String, default: "" },
      visibility: { type: String, enum: ["Public", "Private"], default: "Public" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, default: "" },
    attachment: {
      name: { type: String, default: "" },
      type: { type: String, default: "" },
      dataUrl: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const requestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "Sent you a team request",
    },
    hackathon: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);
const TeamRequest = mongoose.model("TeamRequest", requestSchema);

/* ================================
   ✅ Auth Middleware
================================ */

function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

/* ================================
   ✅ AUTH ROUTES
================================ */

app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      skills,
      semester,
      department,
      githubUrl,
      hackathonsParticipated,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      skills,
      semester: semester || "",
      department: department || "",
      githubUrl: githubUrl || "",
      hackathonsParticipated: Number(hackathonsParticipated) || 0,
    });

    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Register route error:", err?.message || err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        semester: user.semester,
        department: user.department,
        githubUrl: user.githubUrl,
        hackathonsParticipated: user.hackathonsParticipated,
        photoUrl: user.photoUrl,
        projects: user.projects || [],
      },
    });
  } catch (err) {
    console.error("Login route error:", err?.message || err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      skills,
      semester,
      department,
      githubUrl,
      hackathonsParticipated,
      photoUrl,
    } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        skills,
        semester: semester || "",
        department: department || "",
        githubUrl: githubUrl || "",
        hackathonsParticipated: Number(hackathonsParticipated) || 0,
        photoUrl: photoUrl || "",
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/delete-account", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
    await TeamRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/projects", authMiddleware, async (req, res) => {
  try {
    const { title, description, techStack, files, link, visibility } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Project title is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.projects = user.projects || [];
    user.projects.unshift({
      title: String(title).trim(),
      description: String(description || "").trim(),
      techStack: Array.isArray(techStack) ? techStack.map((t) => String(t).trim()).filter(Boolean) : [],
      files: Array.isArray(files)
        ? files.map((f) => ({
            name: String(f?.name || ""),
            type: String(f?.type || ""),
            size: Number(f?.size || 0),
            dataUrl: String(f?.dataUrl || ""),
          }))
        : [],
      link: String(link || "").trim(),
      visibility: visibility === "Private" ? "Private" : "Public",
    });

    await user.save();
    res.status(201).json({ message: "Project saved", projects: user.projects });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/projects/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { link } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const raw = String(link || "").trim();
    const normalized =
      raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;

    project.link = normalized;
    await user.save();

    res.json({ message: "Project updated", projects: user.projects });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   ✅ REQUEST ROUTES
================================ */

app.post("/api/requests", authMiddleware, async (req, res) => {
  try {
    const { toUserId, message, hackathon } = req.body;
    const fromUserId = req.user.id;

    if (!toUserId) return res.status(400).json({ error: "toUserId is required" });
    if (String(toUserId) === String(fromUserId)) {
      return res.status(400).json({ error: "You cannot send a request to yourself" });
    }

    const existingPending = await TeamRequest.findOne({
      fromUserId,
      toUserId,
      status: "pending",
    });

    if (existingPending) {
      const populatedExisting = await TeamRequest.findById(existingPending._id)
        .populate("fromUserId", "name email")
        .populate("toUserId", "name email");

      io.to(toUserId).emit("requestUpdated");
      io.to(fromUserId).emit("requestUpdated");

      return res.status(200).json(populatedExisting);
    }

    const newRequest = await TeamRequest.create({
      fromUserId,
      toUserId,
      message: message || "Sent you a team request",
      hackathon: hackathon || "",
    });

    const populatedRequest = await TeamRequest.findById(newRequest._id)
      .populate("fromUserId", "name email")
      .populate("toUserId", "name email");

    io.to(toUserId).emit("requestUpdated");
    io.to(fromUserId).emit("requestUpdated");

    res.status(201).json(populatedRequest);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/requests", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await TeamRequest.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
      .populate("fromUserId", "name email")
      .populate("toUserId", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/requests/:requestId/status", authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const allowed = ["accepted", "declined"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const teamRequest = await TeamRequest.findById(requestId);
    if (!teamRequest) return res.status(404).json({ error: "Request not found" });

    if (String(teamRequest.toUserId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Only receiver can update request status" });
    }

    teamRequest.status = status;
    await teamRequest.save();

    io.to(String(teamRequest.toUserId)).emit("requestUpdated");
    io.to(String(teamRequest.fromUserId)).emit("requestUpdated");

    res.json(teamRequest);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   ✅ MESSAGE ROUTES (NO 404 NOW)
================================ */

// 🔹 Send Message
app.post("/api/messages/send", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text, attachment } = req.body;
    const hasText = Boolean(String(text || "").trim());
    const hasAttachment = Boolean(attachment?.dataUrl);
    if (!hasText && !hasAttachment) {
      return res.status(400).json({ error: "Message text or attachment is required" });
    }
    if (hasAttachment && String(attachment?.dataUrl || "").length > 12_000_000) {
      return res.status(413).json({ error: "Attachment is too large. Please upload a smaller file." });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      text: String(text || "").trim(),
      attachment: hasAttachment
        ? {
            name: String(attachment?.name || "Attachment"),
            type: String(attachment?.type || ""),
            dataUrl: String(attachment?.dataUrl || ""),
          }
        : undefined,
    });

    // Emit to receiver in real-time
    io.to(receiverId).emit("receiveMessage", message);
    // Emit to sender too so sender UI updates without an extra fetch
    if (String(receiverId) !== String(req.user.id)) {
      io.to(req.user.id).emit("receiveMessage", message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Get Chat History
app.get("/api/messages/:otherUserId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.otherUserId },
        { senderId: req.params.otherUserId, receiverId: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   ✅ SOCKET.IO SETUP
================================ */

const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(
        origin || ""
      );
      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
        return callback(null, true);
      }
      return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Allow larger realtime payloads for base64 file attachments.
  maxHttpBufferSize: 5e7,
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join room using userId
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("sendRequest", ({ toUserId, fromUserId, fromUserName, message, hackathon }) => {
    if (!toUserId || !fromUserId || !fromUserName) return;

    io.to(toUserId).emit("newRequest", {
      fromUserId,
      fromUserName,
      message: message || "Sent you a team request",
      hackathon,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

/* ================================
   ✅ START SERVER (ONLY ONCE)
================================ */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
