import crypto from "crypto";
import { cookies } from "next/headers";

export function token() {
  const pw = process.env.ADMIN_PASSWORD || "";
  return crypto.createHash("sha256").update(pw + "|shehrat-admin").digest("hex");
}
export function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const c = cookies().get("adm")?.value || "";
  const a = Buffer.from(c), b = Buffer.from(token());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
