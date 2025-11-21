import React, { useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function RegisterPage({ navigate }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"customer" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("Registered successfully. Please login.");
      navigate("login");
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><br/>
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><br/>
      <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><br/>
      <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
        <option value="customer">Customer</option>
        <option value="admin">Admin/Worker</option>
      </select><br/>
      <button type="submit">Register</button>
      <p>{msg}</p>
    </form>
  );
}
