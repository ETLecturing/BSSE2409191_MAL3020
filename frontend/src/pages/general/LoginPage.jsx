import React, { useState } from "react";

// 🔥 Auto-detect LAN IP for backend (same for every device)
const API_BASE = `http://${window.location.hostname}:5000/api`;

export default function LoginPage({ setUser, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // 1. Login request
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // 2. Save token
      localStorage.setItem("token", data.token);

      // 3. Fetch logged-in profile
      const profileRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      const me = await profileRes.json();
      if (!profileRes.ok) throw new Error(me.error);

      // 4. Save user globally
      setUser({
        id: me.id,
        name: me.name,
        email: me.email,
        role: me.role,
      });

      // 5. Navigate (no slashes)
      if (me.role === "admin" || me.role === "worker") {
        navigate("adminDashboard");
      } else {
        navigate("userDashboard");
      }
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      style={{ maxWidth: "350px", margin: "0 auto", textAlign: "center" }}
    >
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputBox}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={inputBox}
      />

      <button type="submit" disabled={loading} style={btn}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {msg && <p style={{ color: "red", marginTop: "10px" }}>{msg}</p>}
    </form>
  );
}

const inputBox = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const btn = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  background: "#0d6efd",
  color: "white",
  cursor: "pointer",
};
