"use client";
import { useEffect, useState } from "react";

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"];
const COLORS = { new: "#c9a45c", confirmed: "#2e7d5b", shipped: "#2f6db5", delivered: "#153729", cancelled: "#b3261e" };
const tk = (n) => "৳" + Number(n).toLocaleString("en-US");

export default function Admin() {
  const [orders, setOrders] = useState(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");

  async function load() {
    const r = await fetch("/api/admin/orders");
    if (r.status === 401) return setOrders(false);
    setOrders((await r.json()).orders || []);
  }
  useEffect(() => { load(); }, []);

  async function login(e) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    r.ok ? load() : setErr("Wrong password");
  }
  async function setStatus(id, status) {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
  }
  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); setOrders(false); }

  const box = { maxWidth: 1100, margin: "0 auto", padding: 20 };
  if (orders === null) return <div style={box}>Loading…</div>;
  if (orders === false)
    return (
      <form onSubmit={login} style={{ ...box, maxWidth: 360, marginTop: 80 }}>
        <h2 style={{ color: "#153729" }}>Shehrat Admin</h2>
        <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} style={{ width: "100%", padding: 12, margin: "10px 0", border: "1px solid #ccc", borderRadius: 8 }} />
        {err && <p style={{ color: "#b3261e" }}>{err}</p>}
        <button style={{ width: "100%", padding: 12, background: "#153729", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer" }}>Log in</button>
      </form>
    );

  const shown = orders.filter((o) => filter === "all" || o.status === filter);
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((t, o) => t + o.total, 0);
  const th = { textAlign: "left", padding: "10px 8px", borderBottom: "2px solid #153729", fontSize: 13 };
  const td = { padding: "10px 8px", borderBottom: "1px solid #e2dacb", verticalAlign: "top", fontSize: 14 };

  return (
    <div style={box}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ color: "#153729", margin: 0 }}>Orders ({orders.length})</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 8 }}>
            <option value="all">All</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={load} style={{ padding: "8px 14px" }}>Refresh</button>
          <a href="/api/admin/orders?format=csv" style={{ padding: "8px 14px", border: "1px solid #888", borderRadius: 4, color: "inherit", textDecoration: "none", fontSize: 13.5 }}>Download CSV</a>
          <button onClick={logout} style={{ padding: "8px 14px" }}>Log out</button>
        </div>
      </div>
      <p style={{ color: "#666" }}>Revenue (excluding cancelled): <b>{tk(revenue)}</b></p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead><tr>{["Order", "Customer", "Items", "Total", "Payment", "Status"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id}>
                <td style={td}><b>{o.id}</b><br /><small>{new Date(o.created_at).toLocaleString()}</small></td>
                <td style={td}>{o.name}<br /><a href={`https://wa.me/88${o.phone}`} target="_blank" rel="noreferrer">{o.phone}</a><br /><small>{o.address}, {o.district} ({o.area})</small>{o.note && <><br /><small><i>Note: {o.note}</i></small></>}</td>
                <td style={td}>{o.items.map((i) => <div key={i.id}>{i.q} × {i.name}</div>)}{o.coupon && <small>Coupon: {o.coupon}</small>}</td>
                <td style={td}><b>{tk(o.total)}</b><br /><small>Delivery {tk(o.shipping)}</small></td>
                <td style={td}>{o.payment}</td>
                <td style={td}><select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} style={{ padding: 6, borderRadius: 6, border: `2px solid ${COLORS[o.status]}` }}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
              </tr>
            ))}
            {!shown.length && <tr><td style={td} colSpan={6}>No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
