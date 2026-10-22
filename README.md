# Shehrat Store (Next.js + Postgres)

- Storefront: `public/store.html`, served at `/`
- Orders API: `POST /api/orders` saves every order in your database (server recalculates price, delivery and coupon)
- Admin dashboard: `/admin` (password protected): view orders, change status, download CSV

## 1. Create a free database (2 minutes)
Use **Neon** (neon.tech) or **Supabase**. Create a project and copy the **Postgres connection string**.
The `orders` table is created automatically on the first order.

## 2. Run locally
```bash
npm install
cp .env.example .env.local      # then edit it: set DATABASE_URL and ADMIN_PASSWORD
npm run dev
```
Open http://localhost:3000 (store) and http://localhost:3000/admin (orders).

## 3. Go live on Vercel (free)
1. Push this folder to a GitHub repo.
2. On vercel.com choose **Add New Project**, import the repo.
3. Under **Environment Variables** add `DATABASE_URL` and `ADMIN_PASSWORD`.
4. Deploy. Your store is at your Vercel link; orders at `/admin`.

## Edit things
- Price, product names, delivery charges, coupons: `lib/config.js` (**server**) AND the matching values inside `public/store.html` (search `PRICE`, `<option value="60">`, `KHIMAR10`).
- WhatsApp number: search `8801885605314` in `public/store.html`.

## How an order flows
Customer places order -> saved in your database (you see it in /admin) -> confirmation page with a "Send order on WhatsApp" button.
If the database is down the customer can still send the order on WhatsApp.
