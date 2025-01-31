import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./src/routes/auth.js";
import usersRoute from "./src/routes/users.js";
import hotelsRoute from "./src/routes/hotels.js";
import roomsRoute from "./src/routes/rooms.js";
import bookingsRoute from "./src/routes/bookings.js";
import subscribeRoute from "./src/controllers/email.controller.js";

dotenv.config();

const app = express();

// MongoDB connection
const MONGO_URI = process.env.MONGO;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

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

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
