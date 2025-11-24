import MenuItem from "../models/MenuItem.js";
import { io } from "../index.js"; // IMPORTANT: bring in socket instance

// ---------------------------------------------
// GET ALL MENU ITEMS
// ---------------------------------------------
export const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
};

// ---------------------------------------------
// ADD NEW MENU ITEM
// ---------------------------------------------
export const addMenuItem = async (req, res) => {
  try {
    const { name, category, price, isAvailable, image } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newItem = await MenuItem.create({
      name,
      category,
      price,
      isAvailable: isAvailable ?? true,
      image: image || null,
    });

    // 🔥 REALTIME BROADCAST
    io.emit("menu:update", { type: "add", item: newItem });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Add menu error:", err);
    res.status(500).json({ error: "Failed to add menu item" });
  }
};

// ---------------------------------------------
// UPDATE MENU ITEM
// ---------------------------------------------
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, isAvailable, image } = req.body;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { name, category, price, isAvailable, image },
      { new: true }
    );

    if (!updatedItem)
      return res.status(404).json({ error: "Menu item not found" });

    // 🔥 REALTIME BROADCAST
    io.emit("menu:update", { type: "edit", item: updatedItem });

    res.json(updatedItem);
  } catch (err) {
    console.error("Update menu error:", err);
    res.status(500).json({ error: "Failed to update menu item" });
  }
};

// ---------------------------------------------
// DELETE MENU ITEM
// ---------------------------------------------
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Menu item not found" });

    // 🔥 REALTIME BROADCAST
    io.emit("menu:update", { type: "delete", id });

    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Delete menu error:", err);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};
