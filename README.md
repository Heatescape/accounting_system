# Balance Tracker

Prepaid balance management for small service businesses (beauty salons, nail studios, etc.). Customers top up credit with the merchant; each visit deducts from their balance. Customers scan a QR code, enter their mobile number, and see their full transaction history.

## Stack

- Next.js 16 (App Router)
- Supabase (Postgres + Auth + Row Level Security)
- Tailwind CSS
- Vercel (deploy)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL Editor
3. Copy your project URL and API keys

### 2. Environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — redirects to `/admin`. Sign up for a merchant account on first visit.

## How it works

- **Merchant** signs up at `/login`, manages customers and records transactions at `/admin`
- **Customer** scans a QR code (generated per-customer in the admin) → enters mobile number → sees balance at `/account`
- Balances are computed in real time from the transactions table — no stored balance column
- Any transaction can be undone (soft delete); balance recalculates automatically

## Deploy

Push to GitHub, connect to [Vercel](https://vercel.com), and add the three env vars in Vercel project settings. Set `NEXT_PUBLIC_APP_URL` to your production domain.

---

## Original Next.js README

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
