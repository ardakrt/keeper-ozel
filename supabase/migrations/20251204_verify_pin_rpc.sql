-- pgcrypto eklentisini aktif et (Hashing işlemleri için gerekli)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- RPC Fonksiyonu: Kullanıcı PIN'ini güvenli bir şekilde doğrular
-- Bu fonksiyon SECURITY DEFINER olarak çalışır, yani RLS politikalarını aşarak hash'i okuyabilir
-- ancak dışarıya sadece TRUE/FALSE döndüğü için güvenlidir.
CREATE OR REPLACE FUNCTION verify_user_pin(p_user_id uuid, p_input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  -- 1. user_preferences tablosundan hash'i çek
  SELECT pin INTO stored_hash
  FROM user_preferences
  WHERE user_id = p_user_id;

  -- 2. Eğer orada yoksa, profiles tablosuna bak (AuthForm'daki eski mantığı korumak için)
  IF stored_hash IS NULL THEN
    SELECT pin INTO stored_hash
    FROM profiles
    WHERE id = p_user_id;
  END IF;

  -- 3. Hash bulunamadıysa (PIN yoksa) başarısız
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  -- 4. Girilen PIN ile saklanan hash'i veritabanı içinde karşılaştır
  -- stored_hash = crypt(p_input_pin, stored_hash) mantığı pgcrypto/bcrypt standardıdır.
  RETURN (stored_hash = crypt(p_input_pin, stored_hash));
END;
$$;
