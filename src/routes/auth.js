import express from "express";
import {
  register,
  verifyEmail,
  login,
  resetPasswordRequest,
  resetPassword,
  verifyResetCode,
} from "../controllers/auth.controllers.js";
import { verifyToken, verifyUser, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", resetPasswordRequest); // For initiating password reset
router.post("/reset-password", resetPassword); // For completing password reset
router.post("/reset-password?code", resetPassword); // For completing password reset
router.post("/verify-reset-code", verifyResetCode);

// Protected routes (with token verification)
router.use(verifyToken); // Ensure token verification for these routes

// Example of adding verifyUser and verifyAdmin where necessary
router.post("/reset-password", verifyUser, resetPassword); // User verification required for this route
router.post("/verify-reset-code", verifyAdmin, verifyResetCode); // Admin verification required for this route

export default router;
