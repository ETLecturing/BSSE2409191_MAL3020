import React, { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${API}/orders`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setOrders)
      .catch(e => setErr(String(e)));
  }, []);

  if (err) return <p style={{ color: "red" }}>Error: {err}</p>;

  return (
    <section>
      <h2>Orders</h2>
      {!orders.length ? (
        <p>No orders found.</p>
      ) : (
        orders.map(o => {
          const total = (o.subtotal ?? 0) + (o.serviceCharge ?? 0);
          return (
            <div key={o._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <p><strong>Status:</strong> {o.status} &nbsp;•&nbsp; <strong>Payment:</strong> {o.paymentMethod}</p>
              <table border="1" cellPadding="6" width="100%">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Unit (RM)</th><th>Line Total (RM)</th></tr>
                </thead>
                <tbody>
                  {o.items?.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.name}</td>
                      <td>{i.qty}</td>
                      <td>{i.unitPrice}</td>
                      <td>{i.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: 8 }}>
                <strong>Subtotal:</strong> RM {Number(o.subtotal).toFixed(2)} &nbsp;|&nbsp;
                <strong>Service Charge:</strong> RM {Number(o.serviceCharge).toFixed(2)} &nbsp;|&nbsp;
                <strong>Total:</strong> RM {total.toFixed(2)}
              </p>
              <small>Created: {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</small>
            </div>
          );
        })
      )}
    </section>
  );
}
