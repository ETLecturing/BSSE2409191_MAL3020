import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
