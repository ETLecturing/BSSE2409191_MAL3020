import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = `http://${window.location.hostname}:5000`;
const socket = io(SOCKET_URL);

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Received");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  // Fetch orders
  const fetchAllOrders = () => {
    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  };

  // WebSocket live updates
  useEffect(() => {
    fetchAllOrders();

    socket.on("order:new", fetchAllOrders);
    socket.on("order:canceled", fetchAllOrders);
    socket.on("order:updated", fetchAllOrders);
    socket.on("order:status", fetchAllOrders);

    return () => {
      socket.off("order:new");
      socket.off("order:canceled");
      socket.off("order:updated");
      socket.off("order:status");
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      setMsg("✅ Status Updated");
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // Color scheme
  const statusColors = {
    Received: "#ff9800",
    Preparing: "#2196f3",
    Ready: "#4caf50",
    "Picked up": "#9e9e9e",
    Canceled: "#f44336",
  };

  // Filter by tab
  let filtered = orders.filter((o) => o.status === activeTab);

  // Search order ID or user ID
  filtered = filtered.filter(
    (o) =>
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.userId?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  filtered.sort((a, b) =>
    sortOrder === "newest"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <section>
      <h2>🛠 Admin Dashboard</h2>

      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {/* 🔹 Tabs */}
      <div style={tabsStyle}>
        {["Received", "Preparing", "Ready", "Picked up", "Canceled"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...tabButton,
                background: activeTab === tab ? "#0d6efd" : "#e0e0e0",
                color: activeTab === tab ? "white" : "black",
              }}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* 🔹 Search Bar & Sort */}
      <div style={filterBar}>
        <input
          placeholder="Search Order ID or User ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchBox}
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={sortSelect}
        >
          <option value="newest">Newest → Oldest</option>
          <option value="oldest">Oldest → Newest</option>
        </select>
      </div>

      {/* 🔹 Orders Grid */}
      <div style={gridContainer}>
        {filtered.length === 0 ? (
          <p style={{ color: "#777" }}>No orders found.</p>
        ) : (
          filtered.map((order) => (
            <div key={order._id} style={orderCard}>
              <div style={{ marginBottom: "8px" }}>
                <b>Order #{order._id.slice(-6).toUpperCase()}</b>
                <br />
                <small>User: {order.userId?.slice(-6).toUpperCase()}</small>
              </div>

              <div style={itemBox}>
                {order.items.map((i) => (
                  <div key={i.menuItemId}>
                    {i.name} × {i.qty}
                  </div>
                ))}
              </div>

              <p>
                <b>Total:</b> RM{" "}
                {(order.subtotal + order.serviceCharge).toFixed(2)}
              </p>

              <p>
                <b>Payment:</b> {order.paymentMethod}
              </p>

              <div
                style={{
                  ...statusChip,
                  background: statusColors[order.status],
                }}
              >
                {order.status}
              </div>

              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                style={statusSelect}
              >
                <option value="Received">Received</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Picked up">Picked up</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* 🔹 Styles */
const tabsStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const tabButton = {
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  border: "none",
};

const filterBar = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "15px",
};

const searchBox = {
  width: "70%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const sortSelect = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #aaa",
};

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "15px",
};

const orderCard = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "15px",
  background: "white",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const itemBox = {
  background: "#f7f7f7",
  padding: "8px",
  borderRadius: "6px",
  marginBottom: "10px",
};

const statusChip = {
  padding: "6px 10px",
  color: "white",
  borderRadius: "6px",
  display: "inline-block",
  marginBottom: "10px",
};

const statusSelect = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};
