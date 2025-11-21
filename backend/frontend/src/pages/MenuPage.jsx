import React, { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${API}/menu`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setItems)
      .catch(e => setErr(String(e)));
  }, []);

  if (err) return <p style={{ color: "red" }}>Error: {err}</p>;

  return (
    <section>
      <h2>Menu</h2>
      {!items.length ? <p>Loading...</p> : (
        <table border="1" cellPadding="6">
          <thead><tr><th>Name</th><th>Category</th><th>Price (RM)</th></tr></thead>
          <tbody>
            {items.map(m => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.category}</td>
                <td>{m.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
