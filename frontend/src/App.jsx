import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";

// general pages
import HomePage from "./pages/general/HomePage.jsx";
import LoginPage from "./pages/general/LoginPage.jsx";
import RegisterPage from "./pages/general/RegisterPage.jsx";

// user pages
import UserDashboard from "./pages/user/UserDashboard.jsx";
import UserOrders from "./pages/user/UserOrders.jsx";

// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ManageMenu from "./pages/admin/ManageMenu.jsx";

// 🔥 Auto-detect LAN backend API
const API_BASE = `http://${window.location.hostname}:5000/api`;

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // 🔥 Check token once & auto-login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCheckedAuth(true);
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setCheckedAuth(true));
  }, []);

  const navigate = (target) => setPage(target);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPage("home");
  };

  if (!checkedAuth) return <p>Loading...</p>;

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: 16,
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h1>Restaurant / Takeaway Ordering System</h1>

      <Navbar user={user} onNavigate={navigate} onLogout={handleLogout} />
      <hr />

      {/* ---------- PUBLIC ROUTES ---------- */}
      {page === "home" && <HomePage user={user} />}
      {page === "login" && <LoginPage setUser={setUser} navigate={navigate} />}
      {page === "register" && <RegisterPage navigate={navigate} />}

      {/* ---------- CUSTOMER ROUTES ---------- */}
      {user?.role === "customer" && (
        <>
          {page === "userDashboard" && <UserDashboard />}
          {page === "userOrders" && <UserOrders />}
        </>
      )}

      {/* ---------- ADMIN / WORKER ROUTES ---------- */}
      {user && ["admin", "worker"].includes(user.role) && (
        <>
          {page === "adminDashboard" && <AdminDashboard />}
          {page === "manageMenu" && <ManageMenu />}
        </>
      )}

      {/* ---------- ACCESS CONTROL ---------- */}
      {!user &&
        [
          "userDashboard",
          "userOrders",
          "adminDashboard",
          "manageMenu",
        ].includes(page) && (
          <>
            <p>⚠️ You must be logged in to access this page.</p>
            <button onClick={() => navigate("login")}>Go to Login</button>
          </>
        )}
    </div>
  );
}
