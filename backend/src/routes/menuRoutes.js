import express from "express";
import {
  getAllMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: anyone can view menu
router.get("/", getAllMenuItems);

// Admin/Worker: manage menu
router.post("/", verifyToken, requireAdmin, addMenuItem);
router.put("/:id", verifyToken, requireAdmin, updateMenuItem);
router.delete("/:id", verifyToken, requireAdmin, deleteMenuItem);

export default router;
