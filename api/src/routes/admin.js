import express from "express";
import {
  getAdminRevenue,
  getAdminSummary,
} from "../controllers/admin.controllers.js";
import {
  acceptBookingRequest,
  declineBookingRequest,
  getBookingRequests,
  sendAcceptedBookingEmail,
} from "../controllers/booking.controllers.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/summary", verifyAdmin, getAdminSummary);
router.get("/revenue", verifyAdmin, getAdminRevenue);
router.get("/booking-requests", verifyAdmin, getBookingRequests);
router.patch("/booking-requests/:id/accept", verifyAdmin, acceptBookingRequest);
router.post(
  "/booking-requests/:id/accepted-email",
  verifyAdmin,
  sendAcceptedBookingEmail
);
router.patch("/booking-requests/:id/decline", verifyAdmin, declineBookingRequest);

export default router;
