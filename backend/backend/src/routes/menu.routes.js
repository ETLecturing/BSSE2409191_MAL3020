import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// define schema for menu 
const menuItemSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    price: Number,
    isAvailable: Boolean,
    image: String,
  },
  { collection: "menu_items" }
); // important: match exact Mongo collection name

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

// GET /api/menu → returns all available menu items
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
