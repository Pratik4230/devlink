import { Server } from "socket.io";
import { createServer } from "http";
import app from "../app.js";
import "dotenv/config";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ userId }) => {
    console.log(`User ${userId} joined`);
    socket.join(userId);
  });

  socket.on("sendMessage", ({ senderId, receiverId, content }) => {
    console.log(`Message from ${senderId} to ${receiverId}: ${content} `);

    const message = { senderId, receiverId, content, timestamp: new Date() };
    io.to(receiverId).emit("receiveMessage", message);
    console.log("Message sent");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { io, server };
