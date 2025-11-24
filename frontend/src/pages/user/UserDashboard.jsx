import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Auto-detect LAN IP for WebSocket
const SOCKET_URL = `http://${window.location.hostname}:5000`;
const socket = io(SOCKET_URL);

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function UserDashboard() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  // Fetch all orders
  const fetchOrders = () => {
    fetch(`${API}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  };

  // WebSocket events
  useEffect(() => {
    fetchOrders();

    // 🔥 User gets real-time updates from admin
    socket.on("order:status", fetchOrders); // admin changed order status
    socket.on("order:updated", fetchOrders); // admin or user updated order
    socket.on("order:new", fetchOrders); // user placed an order (optional for user)
    socket.on("order:canceled", fetchOrders); // user/admin canceled

    return () => {
      socket.off("order:status");
      socket.off("order:updated");
      socket.off("order:new");
      socket.off("order:canceled");
    };
  }, []);

  // Status colors
  const getStatusColor = (status) =>
    ({
      Received: "orange",
      Preparing: "blue",
      Ready: "green",
      "Picked up": "gray",
      Canceled: "red",
    }[status] || "gray");

  // Cancel
  const handleCancel = async (id) => {
    if (!confirm("Cancel this order?")) return;

    try {
      const res = await fetch(`${API}/orders/${id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg("❌ Order canceled successfully");
      fetchOrders();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // Edit
  const handleEdit = (order) =>
    setEditingOrder({
      ...order,
      paymentMethod: order.paymentMethod || "cash",
    });

  // Save edit
  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${API}/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod: editingOrder.paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg("✅ Order updated successfully");
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // Button style
  const btn = (type) => ({
    background:
      type === "warning"
        ? "#ffc107"
        : type === "danger"
        ? "#dc3545"
        : "#28a745",
    color: type === "warning" ? "black" : "white",
    border: "none",
    borderRadius: "5px",
    padding: "4px 8px",
    marginRight: "5px",
    cursor: "pointer",
  });

  // Action column
  const renderActions = (order) =>
    order.status === "Received" ? (
      <>
        <button onClick={() => handleEdit(order)} style={btn("warning")}>
          ✏️ Edit
        </button>
        <button onClick={() => handleCancel(order._id)} style={btn("danger")}>
          ❌ Cancel
        </button>
      </>
    ) : (
      <span style={{ color: "gray" }}>No action</span>
    );

  // Orders table
  const renderOrders = () =>
    orders.length === 0 ? (
      <p>No orders found.</p>
    ) : (
      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Items</th>
            <th>Total (RM)</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o._id.slice(-6).toUpperCase()}</td>
              <td>
                {o.items.map((i) => (
                  <div key={i.menuItemId}>
                    {i.name} × {i.qty}
                  </div>
                ))}
              </td>
              <td>{(o.subtotal + o.serviceCharge).toFixed(2)}</td>
              <td>{o.paymentMethod}</td>
              <td>
                <b style={{ color: getStatusColor(o.status) }}>{o.status}</b>
              </td>
              <td>{renderActions(o)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

  // Modal styles
  const modalOverlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  };

  const modalBox = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
  };

  const selectBox = {
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  };

  // Edit modal
  const renderEditModal = () =>
    editingOrder && (
      <div style={modalOverlay}>
        <div style={modalBox}>
          <h3>Edit Order</h3>
          <p>Change payment method:</p>

          <select
            value={editingOrder.paymentMethod}
            onChange={(e) =>
              setEditingOrder({
                ...editingOrder,
                paymentMethod: e.target.value,
              })
            }
            style={selectBox}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>

          <div>
            <button onClick={handleSaveEdit} style={btn("success")}>
              Save
            </button>
            <button onClick={() => setEditingOrder(null)} style={btn("danger")}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <section>
      <h2>📋 My Orders</h2>
      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {renderOrders()}
      {renderEditModal()}
    </section>
  );
}
