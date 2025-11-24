import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Auto-detect LAN IP
const SOCKET_URL = `http://${window.location.hostname}:5000`;
const socket = io(SOCKET_URL);

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function ManageMenu() {
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    isAvailable: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  // Fetch menu items
  const fetchMenu = () => {
    fetch(`${API}/menu`)
      .then((res) => res.json())
      .then(setMenu)
      .catch(console.error);
  };

  // Initialize + WebSocket real-time sync
  useEffect(() => {
    fetchMenu();

    socket.on("menu:update", fetchMenu);
    return () => socket.off("menu:update");
  }, []);

  // Auto-generate unique category list
  const categories = ["All", ...new Set(menu.map((i) => i.category))];

  // Filter by category
  let filtered =
    activeCategory === "All"
      ? menu
      : menu.filter((i) => i.category === activeCategory);

  // Search filter
  filtered = filtered.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  /** ------------------------
   *  Add / Update Menu Item
   * ------------------------ */
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
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save item");

      setMsg(editingId ? "✅ Item updated!" : "✅ Item added!");
      setEditingId(null);
      setForm({ name: "", category: "", price: "", isAvailable: true });
      fetchMenu();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  /** ------------------------
   *  Delete item
   * ------------------------ */
  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;

    try {
      const res = await fetch(`${API}/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg("🗑️ Item deleted!");
      fetchMenu();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  /** ------------------------
   *  Edit item
   * ------------------------ */
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

      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {/* Search + Add form */}
      <div style={filterBar}>
        <input
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchBox}
        />
      </div>

      {/* Category Tabs */}
      <div style={tabsStyle}>
        {categories.map((cat) => (
          <button
            key={cat}
            style={{
              ...tabButton,
              background: activeCategory === cat ? "#0d6efd" : "#e0e0e0",
              color: activeCategory === cat ? "white" : "black",
            }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={input}
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
          style={input}
        />

        <input
          type="number"
          placeholder="Price (RM)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          style={input}
        />

        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) =>
              setForm({ ...form, isAvailable: e.target.checked })
            }
          />
          Available
        </label>

        <button style={saveBtn}>{editingId ? "Update" : "Add Item"}</button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", category: "", price: "", isAvailable: true });
            }}
            style={cancelBtn}
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Menu Items (Card Layout) */}
      <div style={gridContainer}>
        {filtered.map((item) => (
          <div key={item._id} style={itemCard}>
            <h4>{item.name}</h4>
            <p style={{ color: "#666" }}>{item.category}</p>
            <p style={{ fontWeight: "bold", color: "#2e7d32" }}>
              RM {item.price.toFixed(2)}
            </p>
            <p>{item.isAvailable ? "🟢 Available" : "🔴 Not Available"}</p>

            <div style={{ marginTop: "10px" }}>
              <button style={editBtn} onClick={() => handleEdit(item)}>
                ✏️ Edit
              </button>
              <button style={deleteBtn} onClick={() => handleDelete(item._id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- STYLES ---------- */

const tabsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginBottom: "15px",
};

const tabButton = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};

const filterBar = { marginBottom: "10px" };

const searchBox = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const formStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "20px",
};

const input = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  flex: "1 1 200px",
};

const saveBtn = {
  background: "#0d6efd",
  padding: "8px 12px",
  borderRadius: "6px",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const cancelBtn = {
  background: "#b71c1c",
  padding: "8px 12px",
  borderRadius: "6px",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
};

const itemCard = {
  padding: "15px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  background: "white",
  textAlign: "center",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const editBtn = {
  background: "#ffc107",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  marginRight: "8px",
};

const deleteBtn = {
  background: "#d32f2f",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  color: "white",
};
