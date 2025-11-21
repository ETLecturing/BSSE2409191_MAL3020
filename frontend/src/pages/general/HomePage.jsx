import React from "react";

export default function HomePage({ user }) {
  const containerStyle = {
    padding: "20px",
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const titleStyle = {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "10px",
  };

  const subtitleStyle = {
    color: "#555",
    marginBottom: "20px",
  };

  const cardContainer = {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "20px",
  };

  const card = {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "20px",
    width: "250px",
    textAlign: "left",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    backgroundColor: "#fafafa",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Welcome to Restaurant Ordering System</h2>
      <p style={subtitleStyle}>
        {user
          ? `Hi ${user.name || "User"}! You are logged in as ${user.role}.`
          : "Browse our menu, place takeaway orders, or manage orders if you're staff."}
      </p>

      {!user ? (
        <>
          <div style={cardContainer}>
            <div style={card}>
              <h3>🍔 Browse Menu</h3>
              <p>View available food & drinks, check prices and availability.</p>
            </div>
            <div style={card}>
              <h3>🧾 Place Orders</h3>
              <p>Order for takeaway or dine-in and track your order status.</p>
            </div>
            <div style={card}>
              <h3>👨‍🍳 Staff Access</h3>
              <p>Admins and staff can manage menu, orders, and users.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <p>Use the navigation above to access your dashboard or manage menu.</p>
          <div style={cardContainer}>
            {user.role === "customer" && (
              <div style={card}>
                <h3>🧾 My Orders</h3>
                <p>View your ongoing, completed, or canceled orders easily.</p>
              </div>
            )}
            {(user.role === "admin" || user.role === "worker") && (
              <div style={card}>
                <h3>📋 Manage Orders</h3>
                <p>Process customer orders, update status, and manage menu items.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
