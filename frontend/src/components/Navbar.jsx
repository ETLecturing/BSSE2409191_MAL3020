import React from "react";

export default function Navbar({ user, onNavigate, onLogout }) {
  const buttonBase = {
    padding: "6px 14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#f9f9f9",
    cursor: "pointer",
    transition: "0.2s",
  };

  const buttonHover = {
    background: "#e8e8e8",
  };

  const navContainer = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    marginBottom: "20px",
    borderBottom: "1px solid #ddd",
  };

  // Helper component to reduce repeated code
  const NavButton = ({ label, go }) => (
    <button
      style={buttonBase}
      onMouseEnter={(e) => (e.target.style.background = buttonHover.background)}
      onMouseLeave={(e) => (e.target.style.background = buttonBase.background)}
      onClick={() => onNavigate(go)}
    >
      {label}
    </button>
  );

  return (
    <nav style={navContainer}>
      {/* Public - Always visible */}
      <NavButton label="Home" go="home" />

      {/* Customer Navigation */}
      {user?.role === "customer" && (
        <>
          <NavButton label="Dashboard" go="userDashboard" />
          <NavButton label="My Orders" go="userOrders" />
        </>
      )}

      {/* Admin & Worker Navigation */}
      {(user?.role === "admin" || user?.role === "worker") && (
        <>
          <NavButton label="Admin Dashboard" go="adminDashboard" />
          <NavButton label="Manage Menu" go="manageMenu" />
        </>
      )}

      {/* Not Logged In */}
      {!user && (
        <>
          <NavButton label="Login" go="login" />
          <NavButton label="Register" go="register" />
        </>
      )}

      {/* Logged In - Logout Button */}
      {user && (
        <button
          style={{
            ...buttonBase,
            background: "#ffe5e5",
            border: "1px solid #ffb3b3",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#ffd6d6")}
          onMouseLeave={(e) => (e.target.style.background = "#ffe5e5")}
          onClick={onLogout}
        >
          Logout ({user.role})
        </button>
      )}
    </nav>
  );
}
