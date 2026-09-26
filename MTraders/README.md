# Mtraders

A full-stack fashion store (shoes, watches, perfumes, bags, accessories and more) built with Next.js, featuring a sliding/animated storefront, a shopping cart, checkout and a complete admin panel to manage products, categories and orders.

## Tech Stack

- **Next.js 15** (App Router, TypeScript) — pages + API routes
- **Tailwind CSS v4** — styling
- **Prisma 6 + PostgreSQL** — database (works on Vercel serverless)
- **NextAuth** — email/password auth with an ADMIN role
- **Zustand** — client-side cart (persisted to localStorage)
- **framer-motion** — animations (hover, slide-in drawer, scroll reveals)
- **embla-carousel** — hero slider, product & category carousels
- **lucide-react** — icons
- **@vercel/blob** — image uploads in production (falls back to local disk in dev)

## Getting Started

```bash
npm install
# set DATABASE_URL in .env to a PostgreSQL connection string (e.g. free Neon DB)
npm run db:push    # create the database schema
npm run db:seed    # seed demo categories, products and admin user
npm run dev        # start at http://localhost:3000
```

> On first install on Windows, if npm blocks install scripts, run:
> `npm approve-scripts --allow-scripts-pending`

### Admin login (seeded)

| Role | Email                | Password  |
| ---- | -------------------- | --------- |
| Admin| `admin@mtraders.com` | `admin123`|

Change these via `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) before seeding.

## Features

### Storefront
- Auto-sliding hero banner with animated text (embla + framer-motion)
- Scroll-reveal category tiles and product carousels ("Featured", "New Arrivals")
- Product cards with hover zoom + quick "Add to cart" slide-up
- Product detail pages with dynamic variant picking (e.g. Size / Color / Volume)
- Category pages with **dynamic filters driven by category attributes**
- Full-text product search
- Slide-in cart drawer with spring animation, cart page with quantity controls
- Checkout with shipping form, server-side pricing and stock deduction
- Login / register

### Admin panel (`/admin` — ADMIN role only)
- Dashboard with store stats (products, categories, orders, revenue, low-stock alert)
- **Add / edit / delete products** with image uploads and unlimited variants
- Dynamic variant attributes from the product's category (add a category attribute → it appears in the product form & storefront filters automatically)
- Manage categories + their custom attributes
- View orders, see items, update order status (PENDING → PAID → SHIPPED → DELIVERED)

## Project Structure

```
prisma/            schema.prisma, seed.ts
public/images/     uploaded product images
src/
  app/
    page.tsx               storefront home (hero + carousels)
    product/[slug]         product detail + variant picker
    category/[slug]        category page + dynamic filters
    cart, checkout, login, register, search
    admin/                 admin dashboard, products, categories, orders
    api/                   products, categories, orders, register, auth
  components/              ui, product, home, admin, cart drawer
  lib/                     prisma client, auth, helpers, data access, uploads
  store/                   zustand cart + UI store
  types/                   shared types + next-auth augmentation
```

## Environment Variables (`.env`)

```env
DATABASE_URL="postgresql://user:password@host/dbname"   # PostgreSQL (required)
NEXTAUTH_SECRET="a-random-secret"     # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"  # in prod: your Vercel domain
ADMIN_EMAIL="admin@mtraders.com"
ADMIN_PASSWORD="admin123"
BLOB_READ_WRITE_TOKEN=""              # optional: Vercel Blob token for uploads
```

## Deploying to Vercel

The project is configured to deploy from GitHub (`vercel-build` runs
`prisma generate` + `prisma db push` automatically).

1. Push this repo to GitHub (already done for `mohauroo90ha-hash/Mtraders`).
2. Go to https://vercel.com/new → **Import Project** → select the **Mtraders** repo.
3. Vercel auto-detects Next.js — no need to change build settings.
4. Create a free Postgres database at **Neon** (https://neon.tech) or **Supabase**.
5. In Vercel → Project → **Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Postgres connection string
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `https://<your-project>.vercel.app`
   - (optional) `BLOB_READ_WRITE_TOKEN` — from Vercel Blob, so uploaded images persist
6. Click **Deploy**. The schema is created on the database automatically.
7. After first deploy, seed the demo data + admin account from your machine:
   `npm run db:seed` (with `DATABASE_URL` pointing at the same Neon DB), then log in at
   `/admin` with `admin@mtraders.com` / `admin123`.

> Image uploads: with a `BLOB_READ_WRITE_TOKEN` set, admin product images are stored
> in Vercel Blob and persist. Without it, uploads fall back to local disk (dev only).
