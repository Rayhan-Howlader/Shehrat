import { Pool } from "pg";

const g = globalThis;
export function pool() {
  if (!g._pgPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const local = /localhost|127\.0\.0\.1/.test(url);
    g._pgPool = new Pool({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false }, max: 3 });
  }
  return g._pgPool;
}

let ready;
export function ensureTable() {
  if (!ready) {
    ready = pool().query(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT NOT NULL, phone TEXT NOT NULL,
      area TEXT NOT NULL, district TEXT NOT NULL, address TEXT NOT NULL, note TEXT,
      payment TEXT NOT NULL, coupon TEXT,
      items JSONB NOT NULL,
      subtotal INT NOT NULL, discount INT NOT NULL, shipping INT NOT NULL, total INT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new'
    )`).catch((e) => { ready = null; throw e; });
  }
  return ready;
}
