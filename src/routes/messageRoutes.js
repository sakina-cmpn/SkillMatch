import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// ✅ SEND MESSAGE ROUTE
router.post("/send", async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const newMessage = new Message({
      sender,
      receiver,
      message,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET MESSAGES BETWEEN TWO USERS
router.get("/:sender/:receiver", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.sender, receiver: req.params.receiver },
        { sender: req.params.receiver, receiver: req.params.sender },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;