import express from "express";
import {
  createBooking,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/booking.controllers.js";

const router = express.Router();

// Route to create a new booking
router.post("/create", createBooking); // simplified route

// Route to get all bookings of the logged-in user
router.get("/get", getUserBookings); // simplified route

// Route to get a single booking by ID
router.get("/:id", getBooking);

// Route to update the status of a booking
router.put("/:id", updateBookingStatus); // simplified route

// Route to delete a booking by ID
router.patch("/:id", deleteBooking);

export default router;
