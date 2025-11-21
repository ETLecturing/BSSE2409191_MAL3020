import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
        unitPrice: Number,
        qty: Number,
        lineTotal: Number,
      },
    ],
    subtotal: Number,
    serviceCharge: Number,
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      default: "cash",
    },
    pickupTime: String,
    status: {
      type: String,
      enum: ["Received", "Preparing", "Ready", "Picked up", "Canceled"],
      default: "Received",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
