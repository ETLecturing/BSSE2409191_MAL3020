import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Auto-detect LAN IP
const SOCKET_URL = `http://${window.location.hostname}:5000`;
const socket = io(SOCKET_URL);

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  // Fetch all orders
  const fetchAllOrders = () => {
    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  };

  // Initial fetch + WebSocket listeners
  useEffect(() => {
    fetchAllOrders();

    // 🔥 Real-time events from backend
    socket.on("order:new", fetchAllOrders); // user placed order
    socket.on("order:canceled", fetchAllOrders); // user/admin canceled
    socket.on("order:updated", fetchAllOrders); // user edited
    socket.on("order:status", fetchAllOrders); // admin changed status

    return () => {
      socket.off("order:new");
      socket.off("order:canceled");
      socket.off("order:updated");
      socket.off("order:status");
    };
  }, []);

  // Update order status
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

      setMsg("✅ Status updated successfully");
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // Colors
  const statusColors = {
    Received: "orange",
    Preparing: "blue",
    Ready: "green",
    "Picked up": "gray",
    Canceled: "red",
  };

  return (
    <section>
      <h2>🛠 Admin Dashboard – Order Management</h2>
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table border="1" cellPadding="6" width="100%">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Items</th>
              <th>Total (RM)</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Change</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const total = (order.subtotal + order.serviceCharge).toFixed(2);
              const shortOrderId = order._id.slice(-6).toUpperCase();
              const shortUserId = order.userId
                ? order.userId.toString().slice(-6).toUpperCase()
                : "N/A";

              return (
                <tr key={order._id}>
                  <td>
                    <b>#{shortOrderId}</b>
                  </td>
                  <td>{shortUserId}</td>

                  <td>
                    {order.items.map((i) => (
                      <div key={i.menuItemId}>
                        {i.name} × {i.qty}
                      </div>
                    ))}
                  </td>

                  <td>{total}</td>
                  <td>{order.paymentMethod}</td>

                  <td>
                    <b style={{ color: statusColors[order.status] }}>
                      {order.status}
                    </b>
                  </td>

                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      style={{
                        padding: "4px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <option value="Received">Received</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Picked up">Picked up</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
