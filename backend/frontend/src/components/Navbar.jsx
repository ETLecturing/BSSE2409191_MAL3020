import React from "react";

export default function Navbar({ user, onNavigate, onLogout }) {
  const buttonStyle = {
    marginRight: 8,
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#f5f5f5",
    cursor: "pointer",
  };

  const navContainer = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  };

  return (
    <nav style={navContainer}>
      {/* Always visible */}
      <button style={buttonStyle} onClick={() => onNavigate("home")}>
        Home
      </button>

      {/* Customer (user) navigation */}
      {user && user.role === "customer" && (
        <>
          <button
            style={buttonStyle}
            onClick={() => onNavigate("userDashboard")}
          >
            Dashboard
          </button>
          <button style={buttonStyle} onClick={() => onNavigate("userOrders")}>
            My Orders
          </button>
        </>
      )}

      {/* Admin / Worker navigation */}
      {user && (user.role === "admin" || user.role === "worker") && (
        <>
          <button
            style={buttonStyle}
            onClick={() => onNavigate("adminDashboard")}
          >
            Admin Dashboard
          </button>
          <button style={buttonStyle} onClick={() => onNavigate("manageMenu")}>
            Manage Menu
          </button>
        </>
      )}

      {/* Not logged in */}
      {!user && (
        <>
          <button style={buttonStyle} onClick={() => onNavigate("login")}>
            Login
          </button>
          <button style={buttonStyle} onClick={() => onNavigate("register")}>
            Register
          </button>
        </>
      )}

      {/* Logged in */}
      {user && (
        <button
          style={{ ...buttonStyle, background: "#ffe5e5" }}
          onClick={onLogout}
        >
          Logout ({user.role})
        </button>
      )}
    </nav>
  );
}
