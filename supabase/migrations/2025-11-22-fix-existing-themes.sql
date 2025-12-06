-- ============================================
-- Fix Existing Theme Values
-- ============================================
-- Kullanıcının bildirdiği sorun: theme_mode=dark ama theme_mode_web=light
-- Bu script, mevcut kullanıcılar için theme_mode değerini yeni sütunlara kopyalar

-- Önce mevcut durumu göster (bilgi amaçlı - yorum satırından çıkararak kullan)
-- SELECT user_id, theme_mode, theme_mode_web, theme_mode_mobile
-- FROM user_preferences
-- WHERE theme_mode IS NOT NULL;

-- Eğer kullanıcı daha önce bir tema seçtiyse (theme_mode != NULL)
-- ve yeni sütunlar hala default değerdeyse, eski değeri kopyala
UPDATE user_preferences
SET
  theme_mode_web = COALESCE(
    CASE
      WHEN theme_mode_web = 'light' AND theme_mode IS NOT NULL AND theme_mode != 'light'
      THEN theme_mode
      ELSE theme_mode_web
    END,
    theme_mode,
    'light'
  ),
  theme_mode_mobile = COALESCE(
    CASE
      WHEN theme_mode_mobile = 'light' AND theme_mode IS NOT NULL AND theme_mode != 'light'
      THEN theme_mode
      ELSE theme_mode_mobile
    END,
    theme_mode,
    'light'
  ),
  updated_at = NOW()
WHERE theme_mode IS NOT NULL
  AND (theme_mode != 'light' OR theme_mode_web != theme_mode OR theme_mode_mobile != theme_mode);

-- Sonuç: theme_mode='dark' olan kullanıcılar için web ve mobile de 'dark' olur
-- Artık kullanıcı istediği platformda istediği temayı seçebilir
