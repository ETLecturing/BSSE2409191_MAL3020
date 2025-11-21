import MenuItem from "../models/MenuItem.js";

//  Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
};

//  Add a new menu item
export const addMenuItem = async (req, res) => {
  try {
    const { name, category, price, isAvailable, image } = req.body;
    if (!name || !category || !price)
      return res.status(400).json({ error: "Missing required fields" });

    const newItem = await MenuItem.create({
      name,
      category,
      price,
      isAvailable: isAvailable ?? true,
      image: image || null,
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add menu item" });
  }
};

//  Update existing menu item
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

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
};

//  Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Menu item not found" });
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};
