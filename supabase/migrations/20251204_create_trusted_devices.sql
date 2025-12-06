-- 1. Güvenilir Cihazlar Tablosu
CREATE TABLE IF NOT EXISTS trusted_devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_token text UNIQUE NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now()
);

-- İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_trusted_devices_token ON trusted_devices(device_token);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);

-- RLS Politikaları (Güvenlik için)
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece kendi cihazlarını görebilir
CREATE POLICY "Users can view own devices" ON trusted_devices
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Güvenli Doğrulama Fonksiyonu (RPC)
-- Bu fonksiyon middleware tarafından çağrılacak
CREATE OR REPLACE FUNCTION verify_device_token(token_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Fonksiyonu yetkili kullanıcı (postgres) gibi çalıştır
AS $$
DECLARE
  is_valid boolean;
BEGIN
  -- Token ve Auth UID eşleşmesini kontrol et
  -- last_used_at alanını güncelle (aktif cihaz takibi için)
  UPDATE trusted_devices
  SET last_used_at = now()
  WHERE device_token = token_input
  AND user_id = auth.uid()
  RETURNING true INTO is_valid;

  RETURN COALESCE(is_valid, false);
END;
$$;
