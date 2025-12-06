drop table if exists public.verification_codes;

create table public.verification_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

alter table public.verification_codes enable row level security;

-- Kullanıcılar sadece kendi ID'leri ile satır ekleyebilir
create policy "Users can insert their own codes"
  on public.verification_codes for insert
  with check (auth.uid() = user_id);

-- Kullanıcılar sadece kendi kodlarını görebilir
create policy "Users can select their own codes"
  on public.verification_codes for select
  using (auth.uid() = user_id);

-- İsteğe bağlı: cron job ile süresi dolanları temizlemek için politika gerekebilir veya admin yetkisi ile yapılır.