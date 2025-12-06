# Platform-Specific Theme Separation

## Problem
Mobil ve web uygulamalar aynı `theme_mode` kolonunu kullanıyordu, bu yüzden kullanıcı mobilde açık tema seçtiğinde web'de de otomatik açık oluyordu.

## Çözüm
Her platform için ayrı tema kolonları:
- `theme_mode_web` - Web için (light/dark)
- `theme_mode_mobile` - Mobil için (light/dark/system)

## Migration Adımları

### 1. SQL Migration'ı Çalıştır
Supabase SQL Editor'de `2025-11-22-separate-theme-modes.sql` dosyasını çalıştırın.

Bu migration:
- ✅ Yeni kolonları ekler (`theme_mode_web`, `theme_mode_mobile`)
- ✅ Mevcut `theme_mode` değerlerini her iki kolona kopyalar
- ✅ Geçerli değerler için constraint ekler

### 2. Kod Değişiklikleri

**Web (Next.js):**
- `contexts/ThemeContext.tsx` - `theme_mode` → `theme_mode_web`
- `app/actions.ts` - `updateUserTheme()` fonksiyonu güncellendi
- `app/actions.ts` - `signUpUser()` fonksiyonu güncellendi

**Mobil (React Native):**
- `lib/theme.js` - `theme_mode` → `theme_mode_mobile`
- Hem okuma hem yazma güncellemesi yapıldı

### 3. Test Et

**Web:**
```bash
cd keeper-web
npm run dev
# Tema değiştir, logout yap, tekrar login ol
# Tema aynı kalmalı
```

**Mobil:**
```bash
cd keeper
npm run start
# Tema değiştir, logout yap, tekrar login ol
# Tema aynı kalmalı
```

**Cross-Platform Test:**
1. Web'de dark mode seç
2. Mobilde light mode seç
3. Her ikisinde de logout/login yap
4. Web dark, mobil light kalmalı ✅

## Geri Dönüş Planı
Eğer sorun yaşarsanız:
```sql
-- Eski kolonu geri getir
UPDATE user_preferences
SET theme_mode = theme_mode_web
WHERE theme_mode IS NULL;
```

## Notlar
- `theme_mode` kolonu backward compatibility için korundu
- İsterseniz tamamen kaldırabilirsiniz: `ALTER TABLE user_preferences DROP COLUMN theme_mode;`
- Mobil'de `system` seçeneği var, web'de yok
