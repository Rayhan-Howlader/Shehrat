import { pool, ensureTable } from "@/lib/db";
import { PRICE, NAMES, AREAS, COUPONS } from "@/lib/config";
export const dynamic = "force-dynamic";

const bad = (m) => Response.json({ error: m }, { status: 400 });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad("Invalid request"); }
  const s = (v, n) => String(v ?? "").trim().slice(0, n);
  const name = s(b.name, 100), district = s(b.district, 100), address = s(b.address, 400), note = s(b.note, 500);
  const phone = s(b.phone, 20).replace(/\D/g, "");
  const area = AREAS[b.area];
  if (name.length < 2 || district.length < 2 || address.length < 6) return bad("Missing details");
  if (!/^0?1[3-9]\d{8}$/.test(phone)) return bad("Invalid phone");
  if (!area) return bad("Invalid area");
  const items = (Array.isArray(b.items) ? b.items : []).map((x) => ({ id: +x.id, q: Math.min(10, Math.max(1, +x.q | 0)) })).filter((x) => NAMES[x.id]);
  if (!items.length) return bad("Cart is empty");

  const sub = items.reduce((t, x) => t + x.q * PRICE, 0);
  const code = s(b.coupon, 30).toUpperCase();
  const rate = COUPONS[code] || 0;
  const discount = Math.round(sub * rate), shipping = +b.area, total = sub - discount + shipping;
  const payment = ["Cash on delivery", "bKash", "Nagad"].includes(b.payment) ? b.payment : "Cash on delivery";
  const lines = items.map((x) => ({ ...x, name: NAMES[x.id], price: PRICE }));

  try {
    await ensureTable();
    for (let i = 0; i < 5; i++) {
      const id = "SH" + Math.floor(100000 + Math.random() * 900000);
      const r = await pool().query(
        `INSERT INTO orders (id,name,phone,area,district,address,note,payment,coupon,items,subtotal,discount,shipping,total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (id) DO NOTHING`,
        [id, name, "0" + phone.replace(/^0/, ""), area, district, address, note || null, payment, rate ? code : null, JSON.stringify(lines), sub, discount, shipping, total]
      );
      if (r.rowCount) return Response.json({ id, total });
    }
    return Response.json({ error: "Could not save order" }, { status: 500 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
