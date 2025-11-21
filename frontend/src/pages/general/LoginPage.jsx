import React, { useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function LoginPage({ setUser, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("token", data.token);
      const me = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` }
      }).then(r => r.json());
      setUser({ ...me, name: data.user.name, email: data.user.email });
      navigate(me.role === "admin" ? "admin" : "user");
    } catch (err) {
      setMsg("Login failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><br/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><br/>
      <button type="submit">Login</button>
      <p>{msg}</p>
    </form>
  );
}
