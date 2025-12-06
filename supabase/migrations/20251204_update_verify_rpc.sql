-- Fonksiyonu sil ve yeni parametre ile yeniden oluştur
DROP FUNCTION IF EXISTS verify_device_token(text);

CREATE OR REPLACE FUNCTION verify_device_token(token_input text, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Admin yetkisiyle çalışır
SET search_path = public -- Güvenlik için search_path sabitlenmeli
AS $$
DECLARE
  is_valid boolean;
BEGIN
  -- Token ve verilen User ID eşleşiyor mu?
  UPDATE trusted_devices
  SET last_used_at = now()
  WHERE device_token = token_input
  AND user_id = target_user_id
  RETURNING true INTO is_valid;

  RETURN COALESCE(is_valid, false);
END;
$$;
