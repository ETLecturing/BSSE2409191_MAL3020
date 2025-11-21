import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function ManageMenu() {
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    isAvailable: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Fetch all menu items
  const fetchMenu = () => {
    fetch(`${API}/menu`)
      .then((res) => res.json())
      .then(setMenu)
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // 🔹 Add or Update Menu Item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API}/menu/${editingId}` : `${API}/menu`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save item");

      setMsg(
        editingId
          ? "✅ Item updated successfully!"
          : "✅ Item added successfully!"
      );
      setForm({ name: "", category: "", price: "", isAvailable: true });
      setEditingId(null);
      fetchMenu();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // 🔹 Delete Item
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API}/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete item");

      setMsg("🗑️ Item deleted successfully!");
      fetchMenu();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // 🔹 Start Editing
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      isAvailable: item.isAvailable,
    });
  };

  return (
    <section>
      <h2>Manage Menu</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />{" "}
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />{" "}
        <input
          type="number"
          step="0.01"
          placeholder="Price (RM)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />{" "}
        <label>
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) =>
              setForm({ ...form, isAvailable: e.target.checked })
            }
          />{" "}
          Available
        </label>{" "}
        <button type="submit">{editingId ? "Update Item" : "Add Item"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", category: "", price: "", isAvailable: true });
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <p>{msg}</p>

      {/* MENU TABLE */}
      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price (RM)</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menu.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.price.toFixed(2)}</td>
              <td>{item.isAvailable ? "✅" : "❌"}</td>
              <td>
                <button onClick={() => handleEdit(item)}>✏️ Edit</button>{" "}
                <button onClick={() => handleDelete(item._id)}>
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
