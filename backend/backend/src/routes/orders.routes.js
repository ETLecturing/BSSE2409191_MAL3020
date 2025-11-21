import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: mongoose.Schema.Types.ObjectId,
    name: String,
    unitPrice: Number,
    qty: Number,
    lineTotal: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    items: [orderItemSchema],
    subtotal: Number,
    serviceCharge: Number,
    paymentMethod: String, // "cash" | "card" | "online"
    pickupTime: Date, // optional
    status: String, // "Received" | "Preparing" | "Ready" | "Picked up"
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "orders" } // match seeded collection name
);

const Order = mongoose.model("Order", orderSchema);

// GET /api/orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
