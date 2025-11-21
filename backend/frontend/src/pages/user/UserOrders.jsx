import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function UserOrders() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [msg, setMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const token = localStorage.getItem("token");

  // 🔹 Fetch menu
  useEffect(() => {
    fetch(`${API}/menu`)
      .then((res) => res.json())
      .then((data) => setMenu(data.filter((item) => item.isAvailable)))
      .catch((err) => console.error("Failed to fetch menu:", err));
  }, []);

  // 🔹 Add item to cart
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

  // 🔹 Update quantity
  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((x) => x._id !== id));
    } else {
      setCart(cart.map((x) => (x._id === id ? { ...x, qty } : x)));
    }
  };

  // 🔹 Totals
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + serviceCharge;

  // 🔹 Place order
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

      {/* ✅ Menu Display */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        {menu.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "12px",
              background: "#fafafa",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              textAlign: "center",
              transition: "transform 0.2s ease",
            }}
          >
            <h4 style={{ marginBottom: "6px" }}>{item.name}</h4>
            <p style={{ color: "#555", marginBottom: "6px" }}>
              {item.category}
            </p>
            <p style={{ fontWeight: "bold", color: "#007b00" }}>
              RM {item.price.toFixed(2)}
            </p>
            <button
              onClick={() => addToCart(item)}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* ✅ Cart Section */}
      <div
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          width: "320px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "10px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
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

            {/* Payment method selection */}
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

      {/* ✅ Success Popup */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
              boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
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
