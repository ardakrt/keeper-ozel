-- Önce eklentiyi garantiye alalım (extensions şemasına kuruyoruz)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Fonksiyonu güncelle
CREATE OR REPLACE FUNCTION verify_user_pin(p_user_id uuid, p_input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- extensions şemasını search_path'e ekledik
AS $$
DECLARE
  stored_hash text;
  is_match boolean;
BEGIN
  -- 1. user_preferences tablosundan hash'i çek
  SELECT pin INTO stored_hash
  FROM user_preferences
  WHERE user_id = p_user_id;

  -- 2. Eğer orada yoksa, profiles tablosuna bak
  IF stored_hash IS NULL THEN
    SELECT pin INTO stored_hash
    FROM profiles
    WHERE id = p_user_id;
  END IF;

  -- 3. Hash bulunamadıysa (PIN yoksa) başarısız
  IF stored_hash IS NULL THEN
    -- Güvenlik için detay vermiyoruz ama loglara düşebilir
    RETURN false;
  END IF;

  -- 4. Girilen PIN ile saklanan hash'i veritabanı içinde karşılaştır
  -- stored_hash = crypt(p_input_pin, stored_hash)
  is_match := (stored_hash = crypt(p_input_pin, stored_hash));
  
  RETURN is_match;
EXCEPTION WHEN OTHERS THEN
    -- Hata durumunda false dön ve hatayı yut (güvenlik için)
    RETURN false;
END;
$$;
