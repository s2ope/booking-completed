import express from "express";
import {
  confirmBookingCheckoutSession,
  createBookingCheckoutSession,
  createCheckoutSession,
} from "../controllers/paymentController.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/bookings/:id/session", verifyToken, createBookingCheckoutSession);
router.post("/bookings/:id/confirm", verifyToken, confirmBookingCheckoutSession);

export default router;
