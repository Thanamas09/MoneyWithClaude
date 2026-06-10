-- ============================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- wallets table
create table if not exists wallets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  name       text not null,
  balance    numeric(12,2) default 0,
  color      text default '#6366f1',
  bg         text default '#6366f115',
  icon       text default '💰',
  created_at timestamptz default now()
);

-- categories table (per-user, seeded on first login)
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  name       text not null,
  type       text check (type in ('income','expense')) not null,
  icon       text,
  color      text default '#6366f1',
  created_at timestamptz default now()
);

-- transactions table
-- category_id stores uuid of categories row as text (no FK for flexibility)
create table if not exists transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  wallet_id    uuid references wallets(id) on delete cascade,
  to_wallet_id uuid references wallets(id),
  type         text check (type in ('income','expense','transfer')) not null,
  amount       numeric(12,2) not null,
  category_id  text,
  note         text,
  date         date not null default current_date,
  time         text,
  created_at   timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table wallets      enable row level security;
alter table categories   enable row level security;
alter table transactions enable row level security;

drop policy if exists "Users own wallets"       on wallets;
drop policy if exists "Users own categories"    on categories;
drop policy if exists "Users own transactions"  on transactions;

create policy "Users own wallets"
  on wallets for all using (auth.uid() = user_id);

create policy "Users own categories"
  on categories for all using (auth.uid() = user_id);

create policy "Users own transactions"
  on transactions for all using (auth.uid() = user_id);

-- ============================================================
-- Migration (if tables already exist from a previous run):
--
-- alter table categories add column if not exists user_id uuid references auth.users;
-- alter table categories add column if not exists color text default '#6366f1';
-- alter table categories add column if not exists created_at timestamptz default now();
-- alter table wallets      add column if not exists bg text;
-- alter table transactions add column if not exists time text;
-- ============================================================
