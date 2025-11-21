import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function UserDashboard() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  // 🔹 Fetch all user orders
  const fetchOrders = () => {
    fetch(`${API}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  };

  useEffect(() => fetchOrders(), []);

  // 🔹 Cancel order
  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(`${API}/orders/${id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel order");
      setMsg("❌ Order canceled successfully");
      fetchOrders();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // 🔹 Edit order (open modal)
  const handleEdit = (order) =>
    setEditingOrder({ ...order, paymentMethod: order.paymentMethod || "cash" });

  // 🔹 Save edited order
  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${API}/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod: editingOrder.paymentMethod }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      setMsg("✅ Order updated successfully");
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // 🔹 Status color helper
  const getStatusColor = (status) => {
    const colors = {
      Received: "orange",
      Preparing: "blue",
      Ready: "green",
      Picked: "gray",
      Canceled: "red",
    };
    return colors[status] || "gray";
  };

  // 🔹 Render order table
  const renderOrders = () => {
    if (orders.length === 0) return <p>No orders found.</p>;

    return (
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
          {orders.map((o) => {
            const total = (o.subtotal + o.serviceCharge).toFixed(2);
            return (
              <tr key={o._id}>
                <td>{o._id.slice(-6).toUpperCase()}</td>
                <td>
                  {o.items.map((i) => (
                    <div key={i.menuItemId}>
                      {i.name} × {i.qty}
                    </div>
                  ))}
                </td>
                <td>{total}</td>
                <td>{o.paymentMethod}</td>
                <td>
                  <b style={{ color: getStatusColor(o.status) }}>{o.status}</b>
                </td>
                <td>{renderActions(o)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // 🔹 Render actions for each order
  const renderActions = (order) => {
    if (order.status === "Received") {
      return (
        <>
          <button
            onClick={() => handleEdit(order)}
            style={btn("warning")}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleCancel(order._id)}
            style={btn("danger")}
          >
            ❌ Cancel
          </button>
        </>
      );
    }
    return <span style={{ color: "gray" }}>No action</span>;
  };

  // 🔹 Button style helper
  const btn = (type) => ({
    background:
      type === "warning" ? "#ffc107" : type === "danger" ? "#dc3545" : "#28a745",
    color: type === "warning" ? "black" : "white",
    border: "none",
    borderRadius: "5px",
    padding: "4px 8px",
    marginRight: "5px",
    cursor: "pointer",
  });

  // 🔹 Render edit modal
  const renderEditModal = () => {
    if (!editingOrder) return null;
    return (
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
            <button
              onClick={() => setEditingOrder(null)}
              style={btn("danger")}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 🔹 Styles
  const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

  // 🔹 Render main UI
  return (
    <section>
      <h2>📋 My Orders</h2>
      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {renderOrders()}
      {renderEditModal()}
    </section>
  );
}
