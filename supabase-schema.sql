-- ============================================================
-- Prepaid Balance Tracker — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Merchants (linked to Supabase Auth users)
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade not null unique,
  business_name text not null,
  created_at timestamptz default now() not null
);

-- Customers (belong to a merchant)
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade not null,
  name text not null,
  mobile text not null,
  starting_balance numeric(10,2) default 0 not null,
  created_at timestamptz default now() not null,
  unique(merchant_id, mobile)
);

-- Transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade not null,
  merchant_id uuid references merchants(id) on delete cascade not null,
  type text not null check (type in ('topup', 'consumption')),
  amount numeric(10,2) not null check (amount > 0),
  service_name text,
  notes text,
  is_deleted boolean default false not null,
  deleted_at timestamptz,
  deleted_notes text,
  created_at timestamptz default now() not null
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table merchants enable row level security;
alter table customers enable row level security;
alter table transactions enable row level security;

-- Merchants: each user sees only their own merchant record
create policy "merchant own record" on merchants
  for all using (auth.uid() = auth_user_id);

-- Customers: merchant sees only their own customers
create policy "merchant own customers" on customers
  for all using (
    merchant_id in (
      select id from merchants where auth_user_id = auth.uid()
    )
  );

-- Transactions: merchant sees only their own transactions
create policy "merchant own transactions" on transactions
  for all using (
    merchant_id in (
      select id from merchants where auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- Helper function: auto-create merchant record on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.merchants (auth_user_id, business_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'business_name', 'My Business'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
