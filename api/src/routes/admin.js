import express from "express";
import {
  getAdminRevenue,
  getAdminSummary,
} from "../controllers/admin.controllers.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/summary", verifyAdmin, getAdminSummary);
router.get("/revenue", verifyAdmin, getAdminRevenue);

export default router;
