import express from "express";
import {
  register,
  verifyEmail,
  login,
  logout,
  resetPasswordRequest,
  resetPassword,
  verifyResetCode,
} from "../controllers/auth.controllers.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);

// Forgot password and reset password routes
router.post("/forgot-password", resetPasswordRequest); // For initiating password reset
router.post("/reset-password", resetPassword); // For completing password reset
router.post("/reset-password?code", resetPassword); // For completing password reset
router.post("/verify-reset-code", verifyResetCode);

// Protected routes (with token verification)
router.use(verifyToken); // Ensure token verification for these routes

// Example of adding verifyUser and verifyAdmin where necessary
// router.post("/reset-password", verifyUser, resetPassword); // User verification required for this route
// router.post("/verify-reset-code", verifyAdmin, verifyResetCode); // Admin verification required for this route

export default router;
