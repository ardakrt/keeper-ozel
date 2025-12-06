-- ============================================
-- Finance Manager: Subscriptions & Loans
-- ============================================
-- Created: 2025-02-22
-- Description: Tracks user subscriptions and loans with billing cycles

create table if not exists public.subscriptions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('subscription', 'loan')),
  amount numeric not null,
  currency text not null default 'TRY',
  billing_cycle text not null, -- 'monthly', 'yearly'
  payment_date integer not null, -- 1 to 31 (day of month)
  total_installments integer null, -- For loans only
  paid_installments integer null default 0, -- For loans only
  linked_card_details text null, -- e.g. 'Garanti **** 1234'
  logo_url text null,
  color text null, -- Optional brand color (hex)
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable Row Level Security
alter table public.subscriptions enable row level security;

-- RLS Policy: Users can only access their own subscriptions
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'subscriptions'
    and policyname = 'subscriptions_owner_all'
  ) then
    create policy subscriptions_owner_all on public.subscriptions
      for all using (auth.uid() = user_id);
  end if;
end $$;

-- Create index for faster queries
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists subscriptions_type_idx on public.subscriptions(type);

-- Add trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();
