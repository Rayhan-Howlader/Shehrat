import { pool, ensureTable } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { STATUSES } from "@/lib/config";
export const dynamic = "force-dynamic";

const no = () => Response.json({ error: "Unauthorized" }, { status: 401 });

export async function GET(req) {
  if (!isAdmin()) return no();
  await ensureTable();
  const { rows } = await pool().query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000");
  if (new URL(req.url).searchParams.get("format") === "csv") {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["Order","Date","Name","Phone","Area","District","Address","Note","Payment","Items","Subtotal","Discount","Shipping","Total","Status"];
    const lines = rows.map((o) => [o.id, new Date(o.created_at).toISOString(), o.name, o.phone, o.area, o.district, o.address, o.note, o.payment, o.items.map((i) => `${i.q}x ${i.name}`).join("; "), o.subtotal, o.discount, o.shipping, o.total, o.status].map(q).join(","));
    return new Response("\ufeff" + [head.map(q).join(","), ...lines].join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=shehrat-orders.csv" } });
  }
  return Response.json({ orders: rows });
}

export async function PATCH(req) {
  if (!isAdmin()) return no();
  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !STATUSES.includes(status)) return Response.json({ error: "Bad request" }, { status: 400 });
  await pool().query("UPDATE orders SET status=$1 WHERE id=$2", [status, id]);
  return Response.json({ ok: true });
}
