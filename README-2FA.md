# 2-Factor Authentication (Device Verification) Setup

This implementation adds a device verification layer after the PIN login.
- **Flow**: Login (PIN) -> Check `device_verified` cookie -> If missing, ask for Email Code -> Verify -> Set Cookie (3 days).

## 1. Database Migration
You must run the SQL migration to create the `verification_codes` table.
Run the contents of `supabase/migrations/20251126_create_verification_codes.sql` in your Supabase SQL Editor.

```sql
create table if not exists public.verification_codes (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

alter table public.verification_codes enable row level security;

create policy "Users can insert their own codes"
  on public.verification_codes for insert
  with check (auth.uid() = (select id from auth.users where email = verification_codes.email));

create policy "Users can select their own codes"
  on public.verification_codes for select
  using (auth.uid() = (select id from auth.users where email = verification_codes.email));
```

## 2. Email Sending Configuration
Currently, the email sending is **MOCKED** (it logs the code to the server console).
To enable real emails:
1. Install an email provider (e.g., `resend` or `nodemailer`).
2. Edit `app/auth-actions.ts`.
3. Update the `sendEmail` function.

Example with Resend:
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to: string, code: string) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: to,
    subject: 'Keeper Verification Code',
    html: `<p>Your verification code is: <strong>${code}</strong></p>`
  });
}
```
