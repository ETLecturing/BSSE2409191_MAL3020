import React, { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function RegisterPage({ navigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });

  const [msg, setMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Password validation function
  const validatePassword = (password) => {
    const rules = [
      { regex: /.{8,}/, message: "At least 8 characters" },
      { regex: /[A-Z]/, message: "At least 1 uppercase letter" },
      { regex: /[a-z]/, message: "At least 1 lowercase letter" },
      { regex: /[0-9]/, message: "At least 1 number" },
      { regex: /[^A-Za-z0-9]/, message: "At least 1 special character" },
    ];

    const failed = rules.filter((rule) => !rule.regex.test(password));

    if (failed.length === 0) return "";
    return "Password requires: " + failed.map((f) => f.message).join(", ");
  };

  // Handle typing
  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });

    if (key === "password") {
      const err = validatePassword(value);
      setPasswordError(err);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Client-side password checks
    if (passwordError) {
      setMsg("❌ Fix password requirements first.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMsg("❌ Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: "customer",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg("✅ Registered successfully! Please login.");
      navigate("login");
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  // Styles
  const box = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  };

  const container = {
    maxWidth: "380px",
    margin: "0 auto",
    marginTop: "30px",
    padding: "20px",
    borderRadius: "10px",
    background: "white",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  };

  const btn = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#0d6efd",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
  };

  return (
    <form onSubmit={handleSubmit} style={container}>
      <h2 style={{ marginBottom: "15px" }}>Create Account</h2>

      <input
        style={box}
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => handleChange("name", e.target.value)}
        required
      />

      <input
        style={box}
        placeholder="Email Address"
        type="email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
      />

      <input
        style={box}
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => handleChange("password", e.target.value)}
        required
      />

      {passwordError && (
        <p style={{ color: "red", fontSize: "13px" }}>{passwordError}</p>
      )}

      <input
        style={box}
        placeholder="Confirm Password"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
        required
      />

      <button style={btn} type="submit">
        Register
      </button>

      {msg && <p style={{ marginTop: "10px", color: "red" }}>{msg}</p>}
    </form>
  );
}
