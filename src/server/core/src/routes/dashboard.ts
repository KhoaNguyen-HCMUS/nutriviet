import express from "express";
import { DashboardController } from "../controllers/dashboardController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Protected routes (authentication required)
router.get("/", authenticateToken, DashboardController.getDashboard);

export default router;
