-- ============================================
-- Add start_date column for Loan Auto-Sync
-- ============================================
-- Created: 2025-02-23
-- Description: Add start_date to accurately track loan payment schedules

-- Add start_date column (nullable, defaults to created_at for existing records)
alter table public.subscriptions
  add column if not exists start_date timestamp with time zone;

-- Backfill existing records: set start_date = created_at
update public.subscriptions
  set start_date = created_at
  where start_date is null;

-- Make start_date required going forward
alter table public.subscriptions
  alter column start_date set default now();

-- Add comment for documentation
comment on column public.subscriptions.start_date is 'Date when the subscription/loan started. Used for calculating payment progress.';
