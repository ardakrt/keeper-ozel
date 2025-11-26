-- ============================================
-- Separate Theme Modes for Web and Mobile
-- ============================================
-- Allows users to have different themes on web and mobile
-- This migration is IDEMPOTENT (can be run multiple times safely)

-- Add new columns for platform-specific themes
DO $$
BEGIN
  -- Add theme_mode_web column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences'
    AND column_name = 'theme_mode_web'
  ) THEN
    ALTER TABLE user_preferences
    ADD COLUMN theme_mode_web TEXT DEFAULT 'light';
  END IF;

  -- Add theme_mode_mobile column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences'
    AND column_name = 'theme_mode_mobile'
  ) THEN
    ALTER TABLE user_preferences
    ADD COLUMN theme_mode_mobile TEXT DEFAULT 'light';
  END IF;
END $$;

-- Migrate existing theme_mode to both columns (only for rows that haven't been migrated)
UPDATE user_preferences
SET
  theme_mode_web = COALESCE(theme_mode_web, theme_mode, 'light'),
  theme_mode_mobile = COALESCE(theme_mode_mobile, theme_mode, 'light')
WHERE theme_mode IS NOT NULL
  AND (theme_mode_web IS NULL OR theme_mode_mobile IS NULL);

-- Add check constraints for valid values (idempotent)
DO $$
BEGIN
  -- Add web theme check constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'theme_mode_web_check'
  ) THEN
    ALTER TABLE user_preferences
    ADD CONSTRAINT theme_mode_web_check
    CHECK (theme_mode_web IN ('light', 'dark'));
  END IF;

  -- Add mobile theme check constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'theme_mode_mobile_check'
  ) THEN
    ALTER TABLE user_preferences
    ADD CONSTRAINT theme_mode_mobile_check
    CHECK (theme_mode_mobile IN ('light', 'dark', 'system'));
  END IF;
END $$;

-- Optional: Keep theme_mode column for backward compatibility
-- If you want to remove it completely, uncomment this:
-- ALTER TABLE user_preferences DROP COLUMN IF EXISTS theme_mode;
