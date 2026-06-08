import express from "express";
import {
  acceptBookingRequest,
  createBooking,
  declineBookingRequest,
  getBookingRequests,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  sendAcceptedBookingEmail,
} from "../controllers/booking.controllers.js";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";
const router = express.Router();

// Route to create a new booking
router.post("/create", verifyToken, createBooking);

// Route to get all bookings of the logged-in user
router.get("/get", verifyToken, getUserBookings);

// Route to get pending booking requests for hotels owned by the admin
router.get("/requests", verifyAdmin, getBookingRequests);

// Route to get a single booking by ID
router.get("/:id", verifyToken, getBooking);

// Route to update the status of a booking
router.put("/:id", verifyAdmin, updateBookingStatus);

// Routes for hotel owners to accept or decline pending booking requests
router.patch("/:id/accept", verifyAdmin, acceptBookingRequest);
router.post("/:id/accepted-email", verifyAdmin, sendAcceptedBookingEmail);
router.patch("/:id/decline", verifyAdmin, declineBookingRequest);

// Route to delete a booking by ID
router.patch("/:id/cancel", verifyToken, cancelBooking);
router.patch("/:id", verifyToken, cancelBooking);

export default router;
