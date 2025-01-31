import express from "express";
import subscribe from "../controllers/subscriber.controller";

const router = express.Router();

// POST /api/subscribe
router.post("/", subscribe);

export default router;
