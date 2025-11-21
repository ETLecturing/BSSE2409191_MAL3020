import express from "express";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  updateUserOrder,
  adminGetAllOrders,
  adminUpdateStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// User routes
router.post("/", verifyToken, createOrder);
router.get("/my", verifyToken, getUserOrders);
router.put("/:id/cancel", verifyToken, cancelOrder);
router.put("/:id", verifyToken, updateUserOrder);

// Admin routes
router.get("/", verifyToken, requireAdmin, adminGetAllOrders);
router.put("/:id/status", verifyToken, requireAdmin, adminUpdateStatus);

export default router;
