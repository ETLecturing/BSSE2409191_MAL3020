import React, { useState } from "react";
import MenuPage from "./pages/MenuPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  const [page, setPage] = useState("menu");

  const navButton = (name, label) => (
    <button onClick={() => setPage(name)} style={{ marginRight: 8 }}>
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h1>Restaurant / Takeaway Ordering</h1>
      <nav style={{ marginBottom: 20 }}>
        {navButton("menu", "Menu")}
        {navButton("orders", "Orders")}
        {navButton("login", "Login")}
        {navButton("register", "Register")}
      </nav>

      {page === "menu" && <MenuPage />}
      {page === "orders" && <OrdersPage />}
      {page === "login" && <LoginPage />}
      {page === "register" && <RegisterPage />}
    </div>
  );
}
