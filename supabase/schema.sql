-- wallets table
create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  balance numeric(12,2) default 0,
  color text default '#6366f1',
  icon text default '💰',
  created_at timestamptz default now()
);

-- categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('income','expense')),
  icon text,
  color text
);

-- transactions table
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  wallet_id uuid references wallets(id) on delete cascade,
  to_wallet_id uuid references wallets(id),
  type text check (type in ('income','expense','transfer')) not null,
  amount numeric(12,2) not null,
  category_id uuid references categories(id),
  note text,
  date date default current_date,
  created_at timestamptz default now()
);

-- RLS policies
alter table wallets enable row level security;
alter table transactions enable row level security;

create policy "Users own wallets" on wallets for all using (auth.uid() = user_id);
create policy "Users own transactions" on transactions for all using (auth.uid() = user_id);

-- Seed default categories
insert into categories (name, type, icon, color) values
('อาหาร', 'expense', '🍔', '#EF9F27'),
('เดินทาง', 'expense', '🚌', '#378ADD'),
('ช้อปปิ้ง', 'expense', '🛍', '#D4537E'),
('สาธารณูปโภค', 'expense', '💡', '#639922'),
('สุขภาพ', 'expense', '🏥', '#7F77DD'),
('บันเทิง', 'expense', '🎬', '#E8593C'),
('อื่นๆ', 'expense', '📦', '#888780'),
('เงินเดือน', 'income', '💼', '#1D9E75'),
('ฟรีแลนซ์', 'income', '💻', '#0F6E56'),
('อื่นๆ', 'income', '➕', '#639922');
