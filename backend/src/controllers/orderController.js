import mongoose from "mongoose";
import Order from "../models/Order.js";

//  Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, subtotal, serviceCharge, paymentMethod, pickupTime } =
      req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Order must have at least one item" });
    }

    const newOrder = await Order.create({
      userId: req.user.id,
      items,
      subtotal: Number(subtotal),
      serviceCharge: Number(serviceCharge),
      paymentMethod: paymentMethod || "cash",
      pickupTime: pickupTime || null,
      status: "Received",
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

//  Get all orders for the logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ Get orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

//  Cancel an order (only if still 'Received')
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    //  Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: id, userId: req.user.id });
    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found or not owned by this user" });
    }

    //  Only allow canceling 'Received' orders
    if (
      ["Preparing", "Ready", "Picked up", "Canceled"].includes(order.status)
    ) {
      return res.status(400).json({
        error: "You can only cancel orders that are still 'Received'.",
      });
    }

    order.status = "Canceled";
    await order.save();

    res.json({ message: " Order canceled successfully", order });
  } catch (err) {
    console.error("❌ Cancel order error:", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

//  Edit an order (user can change payment method before preparation)
export const updateUserOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    //  Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: id, userId: req.user.id });
    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found or not owned by this user" });
    }

    //  Only editable when 'Received'
    if (
      ["Preparing", "Ready", "Picked up", "Canceled"].includes(order.status)
    ) {
      return res
        .status(400)
        .json({ error: "Cannot edit order once preparation has started." });
    }

    if (paymentMethod) order.paymentMethod = paymentMethod;
    await order.save();

    res.json({ message: "✅ Order updated successfully", order });
  } catch (err) {
    console.error("❌ Update order error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};

//  Admin: Get all orders
export const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Admin fetch orders error:", err);
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
};

//  Admin: Update order status
export const adminUpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["Received", "Preparing", "Ready", "Picked up", "Canceled"];
    if (!allowed.includes(status))
      return res.status(400).json({ error: "Invalid status value" });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Status updated", order });
  } catch (err) {
    console.error("❌ Admin update status error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};
