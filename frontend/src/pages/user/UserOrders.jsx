import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Auto-detect LAN IP for WebSocket
const SOCKET_URL = `http://${window.location.hostname}:5000`;
const socket = io(SOCKET_URL);

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function UserOrders() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [msg, setMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const token = localStorage.getItem("token");

  // Fetch menu
  const fetchMenu = () => {
    fetch(`${API}/menu`)
      .then((res) => res.json())
      .then((data) => setMenu(data.filter((item) => item.isAvailable)))
      .catch((err) => console.error("Failed to fetch menu:", err));
  };

  // Initial load + WebSocket listeners
  useEffect(() => {
    fetchMenu();

    socket.on("menu:update", fetchMenu);
    return () => socket.off("menu:update");
  }, []);

  // Auto-generate categories
  const categories = ["All", ...new Set(menu.map((i) => i.category))];

  // Filter by category
  let filteredMenu =
    activeCategory === "All"
      ? menu
      : menu.filter((i) => i.category === activeCategory);

  // Apply search filter
  filteredMenu = filteredMenu.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add item to cart
  const addToCart = (item) => {
    const exists = cart.find((x) => x._id === item._id);
    if (exists) {
      setCart(
        cart.map((x) => (x._id === item._id ? { ...x, qty: x.qty + 1 } : x))
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // Update quantity
  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((x) => x._id !== id));
    } else {
      setCart(cart.map((x) => (x._id === id ? { ...x, qty } : x)));
    }
  };

  // Totals
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + serviceCharge;

  // Place order
  const handleSubmit = async () => {
    if (cart.length === 0) {
      setMsg("❌ Please add items to your cart first.");
      return;
    }

    try {
      const orderItems = cart.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        unitPrice: item.price,
        qty: item.qty,
        lineTotal: item.price * item.qty,
      }));

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          subtotal,
          serviceCharge,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      setCart([]);
      setShowSuccess(true);
      setMsg("");
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  return (
    <section style={{ position: "relative" }}>
      <h2>🍽️ Order Your Meal</h2>
      {msg && <p style={{ color: "red" }}>{msg}</p>}

      {/*  Search bar */}
      <input
        placeholder="Search menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "15px",
        }}
      />

      {/* Category tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: activeCategory === cat ? "#0d6efd" : "#e4e4e4",
              color: activeCategory === cat ? "white" : "black",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        {filteredMenu.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "12px",
              background: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h4>{item.name}</h4>
            <p style={{ color: "#777" }}>{item.category}</p>
            <p style={{ fontWeight: "bold", color: "#2e7d32" }}>
              RM {item.price.toFixed(2)}
            </p>
            <button
              onClick={() => addToCart(item)}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "7px 12px",
                cursor: "pointer",
                marginTop: "6px",
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* 🛒 Fixed Cart */}
      <div
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          width: "320px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "15px",
          zIndex: 999,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ textAlign: "center" }}>🧾 Your Cart</h3>

        {cart.length === 0 ? (
          <p style={{ textAlign: "center" }}>No items added.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item._id}
                style={{
                  borderBottom: "1px solid #eee",
                  marginBottom: "8px",
                  paddingBottom: "8px",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{item.name}</div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      updateQty(item._id, Number(e.target.value))
                    }
                    style={{
                      width: "60px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      padding: "3px",
                    }}
                  />
                  <span>RM {(item.price * item.qty).toFixed(2)}</span>
                </div>
              </div>
            ))}

            <hr />
            <p>Subtotal: RM {subtotal.toFixed(2)}</p>
            <p>Service Charge (10%): RM {serviceCharge.toFixed(2)}</p>
            <p style={{ fontWeight: "bold" }}>Total: RM {total.toFixed(2)}</p>

            {/* Payment */}
            <label style={{ display: "block", marginTop: "10px" }}>
              Payment Method:
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: "100%",
                padding: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>

            <button
              onClick={handleSubmit}
              style={{
                marginTop: "12px",
                width: "100%",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "8px",
                cursor: "pointer",
              }}
            >
              Confirm Order
            </button>
          </>
        )}
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "30px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h3>✅ Order Successful!</h3>
            <p>Thank you for your order.</p>
            <button
              onClick={() => setShowSuccess(false)}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "8px 15px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
