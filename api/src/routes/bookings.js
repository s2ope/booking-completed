import express from "express";
import {
  createBooking,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking.controllers.js";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";
const router = express.Router();

// Route to create a new booking
router.post("/create", verifyToken, createBooking);

// Route to get all bookings of the logged-in user
router.get("/get", verifyToken, getUserBookings);

// Route to get a single booking by ID
router.get("/:id", verifyToken, getBooking);

// Route to update the status of a booking
router.put("/:id", verifyAdmin, updateBookingStatus);

// Route to delete a booking by ID
router.patch("/:id/cancel", verifyToken, cancelBooking);
router.patch("/:id", verifyToken, cancelBooking);

export default router;
