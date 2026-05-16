# Balance Tracker

> Prepaid balance management for small service businesses — built with Next.js 16, Supabase, and Tailwind.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20RLS-3ecf8e?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

Beauty salons, nail studios, massage shops — businesses where customers top up credit upfront and burn it down per visit. This app digitises the paper ledger: **merchants record top-ups and consumptions, customers scan a QR code and instantly see their balance and full transaction history** — no app install, no signup.

## What it does

**For merchants**

- Sign up at `/login` → private dashboard at `/admin`
- Add customers (name + mobile, scoped to your business)
- Record top-ups and consumptions in one tap
- Each customer gets a unique QR code linking to their balance page
- Configure a service menu so common transactions are one click
- Undo any transaction with a reason — soft delete, balance auto-recomputes

**For customers**

- Scan the QR code in the salon
- Enter their mobile number (no account creation, no app)
- See current balance + full transaction history

## Architecture

```
┌──────────────────┐         ┌──────────────────┐
│ Merchant browser │         │ Customer browser │
│   /admin/*       │         │   /c/[id], /acc..│
└────────┬─────────┘         └─────────┬────────┘
         │                             │
         │ Next.js 16 App Router (RSC + Route Handlers)
         ▼                             ▼
   ┌─────────────────────────────────────────┐
   │  @supabase/ssr  (cookie-based session)  │
   └─────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Supabase                    │
        │  ├─ Auth (merchants)         │
        │  ├─ Postgres (4 tables)      │
        │  └─ RLS (multi-tenant)       │
        └──────────────────────────────┘
```

### Key design choices

- **Balance is derived, not stored.** Every customer's balance is computed on read as `starting_balance + Σ(topups) − Σ(consumptions)` over non-deleted transactions. No stored balance column means no drift, no manual reconciliation, no race conditions.
- **Soft delete + automatic recompute.** Every transaction can be undone; the deletion is itself an audit event (with reason and timestamp). Balance recalculates from the remaining ledger.
- **Multi-tenant by Row-Level Security.** Each merchant's data is isolated at the *database layer* — even sharing one Supabase project, two merchants cannot read each other's customers or transactions. RLS policies are the source of truth.
- **Customers are anonymous.** No customer signup. Mobile-number lookup against the merchant's customer list is all that's needed.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| Backend | Supabase (Postgres + Auth + RLS) |
| SSR auth | `@supabase/ssr` (cookie-based session) |
| QR generation | `qrcode` (client-side, no server roundtrip) |
| Deploy | Vercel |

## Data model

```
merchants ─┬─ customers ─── transactions
           └─ services
```

- **`merchants`** — one row per signed-up business, linked 1:1 to a Supabase Auth user via a signup trigger
- **`customers`** — belongs to a merchant; identified by `(merchant_id, mobile)` (unique)
- **`transactions`** — `type: 'topup' | 'consumption'`, soft-deletable with audit columns (`is_deleted`, `deleted_at`, `deleted_notes`)
- **`services`** — merchant's reusable service menu (name + price)

All four tables have RLS enabled. The full schema is in [`supabase-schema.sql`](./supabase-schema.sql).

## Quick start

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL editor, run [`supabase-schema.sql`](./supabase-schema.sql)
3. *(optional)* Run [`seed.sql`](./seed.sql) for demo data
4. Grab your **Project URL**, **anon key**, and **service_role key** from *Settings → API*

### 2. Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) → redirects to `/admin`. Sign up on first visit; the trigger auto-provisions your merchant record.

## Project structure

```
src/
├── app/
│   ├── page.tsx                          # landing → /admin
│   ├── login/page.tsx                    # merchant sign in / up
│   ├── login-required/page.tsx           # gate
│   ├── c/[merchantId]/page.tsx           # QR entry → mobile prompt
│   ├── account/                          # customer-side balance view
│   │   ├── page.tsx
│   │   ├── [customerId]/page.tsx
│   │   └── LogoutButton.tsx
│   ├── admin/                            # merchant dashboard (auth-gated)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── customers/new/page.tsx
│   │   ├── customers/[id]/page.tsx       # QR + history + undo
│   │   ├── services/page.tsx
│   │   └── transactions/new/page.tsx
│   └── api/
│       ├── auth/logout/route.ts
│       ├── customer-login/route.ts
│       ├── customer-logout/route.ts
│       └── transactions/[id]/undo/route.ts
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   └── utils.ts
└── proxy.ts                              # Next middleware (session refresh)
```

## Deployment

The simplest path is Vercel:

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com/new)
3. Set the four environment variables under **Project Settings → Environment Variables**
4. Deploy — Vercel detects Next.js automatically

Alternatively `npm run build && npm start` on any Node-capable host (set `NEXT_PUBLIC_APP_URL` to your production domain so QR code links resolve correctly).

## Security model

- **Row-Level Security** is the source of truth for tenant isolation — every `merchants`, `customers`, `transactions`, and `services` query is RLS-scoped to `auth.uid()`. The app code cannot accidentally leak across tenants because the database refuses to return cross-tenant rows.
- **Service role key** never leaves the server. It's used only by the signup trigger and the customer-login route handler.
- **Customer-side lookup** by mobile number is constrained to a single merchant's customer table per request, and the customer session is a short-lived signed cookie (no Supabase Auth user).
- **Soft delete** preserves audit history — no transaction is ever physically removed.

## Roadmap

- [ ] Email / SMS receipts on each transaction
- [ ] Refund flow (consumption → topup reversal with linked transaction)
- [ ] Multi-currency support
- [ ] CSV export for merchant accounting
- [ ] Customer-facing transaction comments

## License

MIT — see [`LICENSE`](./LICENSE).

---

Built by [@Heatescape](https://github.com/Heatescape).
