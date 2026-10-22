import { token } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `adm=${token()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return res;
}
export async function DELETE() {
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", "adm=; Path=/; HttpOnly; Max-Age=0");
  return res;
}
