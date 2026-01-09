import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoute from "./src/routes/auth.js";
import usersRoute from "./src/routes/users.js";
import hotelsRoute from "./src/routes/hotels.js";
import roomsRoute from "./src/routes/rooms.js";
import bookingsRoute from "./src/routes/bookings.js";
import subscribeRoute from "./src/controllers/email.controller.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

// MongoDB connection
const MONGO_URI = process.env.MONGO;

mongoose
  .connect(MONGO_URI, {
    family: 4, // forces IPv4 instead of IPv6
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Middleware
// Allow your deployed frontend sites to talk to your backend
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// ✅ Test route for the root URL (so / won't show 404)
app.get("/", (req, res) => {
  res.send("Backend working successfully on Render with ES modules!");
});

// ✅ Example API route
app.get("/api/test", (req, res) => {
  res.json({ message: "API test successful" });
});

// Chat system
io.on("connection", (socket) => {
  console.log("Client connected");

  // Join a room based on booking ID
  socket.on("join_room", (bookingId) => {
    socket.join(bookingId);
    console.log(`User joined room: ${bookingId}`);
  });

  // Handle direct message between client and admin
  socket.on("direct_message", (data) => {
    // Broadcast message to everyone in the booking room except sender
    socket.to(data.bookingId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/rooms", roomsRoute);
app.use("/api/bookings", bookingsRoute);
app.use("/api/subscribe", subscribeRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
// console.log("MONGO_URI:", process.env.MONGO);

const PORT = process.env.PORT || 8800;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
