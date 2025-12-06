-- ============================================
-- RPC Function for Push to Login
-- ============================================

-- Function to get user_id by email
-- This is needed because web app cannot directly query auth.users table
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_input TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_result UUID;
BEGIN
  SELECT id INTO user_id_result
  FROM auth.users
  WHERE email = email_input
  LIMIT 1;

  RETURN user_id_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO anon;

-- Add comment
COMMENT ON FUNCTION get_user_id_by_email(TEXT) IS 'Returns user_id for a given email address. Used for Push to Login feature.';
