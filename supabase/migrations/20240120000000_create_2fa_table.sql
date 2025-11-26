-- Create 2FA/OTP codes table
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Service info
  service_name TEXT NOT NULL,
  account_name TEXT, -- email or username
  issuer TEXT, -- Company name (Google, GitHub, etc)

  -- Secret key (encrypted with Basis Theory)
  bt_token_id_secret TEXT NOT NULL, -- Basis Theory token ID for secret

  -- Display
  icon_url TEXT,
  color TEXT,
  category TEXT, -- work, personal, finance, etc

  -- Settings
  algorithm TEXT DEFAULT 'SHA1' CHECK (algorithm IN ('SHA1', 'SHA256', 'SHA512')),
  digits INTEGER DEFAULT 6 CHECK (digits IN (6, 7, 8)),
  period INTEGER DEFAULT 30 CHECK (period IN (15, 30, 60)),

  -- Metadata
  notes TEXT,
  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON public.otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_service_name ON public.otp_codes(service_name);
CREATE INDEX IF NOT EXISTS idx_otp_codes_category ON public.otp_codes(category);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own OTP codes"
  ON public.otp_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OTP codes"
  ON public.otp_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OTP codes"
  ON public.otp_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OTP codes"
  ON public.otp_codes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_otp_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_otp_codes_updated_at
  BEFORE UPDATE ON public.otp_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_otp_codes_updated_at();
