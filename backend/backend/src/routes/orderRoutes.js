import express from "express";
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  updateUserOrder,
  adminGetAllOrders,
  adminUpdateStatus,
} from "../controllers/orderController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/my", verifyToken, getUserOrders);
router.put("/:id/cancel", verifyToken, cancelOrder);
router.put("/:id", verifyToken, updateUserOrder);

router.get("/", verifyToken, requireAdmin, adminGetAllOrders);
router.put("/:id/status", verifyToken, requireAdmin, adminUpdateStatus);

export default router;
