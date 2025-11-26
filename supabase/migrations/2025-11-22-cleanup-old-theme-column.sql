-- ============================================
-- Cleanup: Sync old theme_mode with web version
-- ============================================
-- This ensures backward compatibility if anything still reads theme_mode

-- Update old theme_mode column to match web theme
UPDATE user_preferences
SET theme_mode = theme_mode_web
WHERE theme_mode IS DISTINCT FROM theme_mode_web;

-- Optional: If you want to completely remove the old column
-- (Only do this if you're 100% sure nothing else uses it)
-- ALTER TABLE user_preferences DROP COLUMN theme_mode;
