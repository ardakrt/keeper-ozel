# Web ve Mobil Tema Ayrımı - Kurulum Adımları

## Durum
Web ve mobil uygulamalar için ayrı tema ayarları eklendi. Artık webde koyu, mobilde açık tema (veya tam tersi) kullanabilirsiniz.

## Yapılan Değişiklikler

### 1. Veritabanı Değişiklikleri
- `user_preferences` tablosuna iki yeni sütun eklendi:
  - `theme_mode_web`: Web uygulaması için tema (light/dark)
  - `theme_mode_mobile`: Mobil uygulama için tema (light/dark/system)

### 2. Kod Değişiklikleri
Tüm dosyalar güncellendi:
- ✅ `app/layout.tsx` - `theme_mode_web` kullanıyor
- ✅ `app/settings/page.tsx` - `theme_mode_web` kullanıyor
- ✅ `app/actions.ts` - `theme_mode_web` kullanıyor
- ✅ `contexts/ThemeContext.tsx` - `theme_mode_web` kullanıyor
- ✅ `lib/theme.js` (mobil) - `theme_mode_mobile` kullanıyor

### 3. Migration Dosyaları
- `supabase/migrations/2025-11-22-separate-theme-modes.sql` - Ana migration (idempotent)
- `supabase/migrations/2025-11-22-cleanup-old-theme-column.sql` - Temizlik (opsiyonel)

## Kurulum Adımları

### Adım 1: Migration'ı Çalıştır
1. Supabase Dashboard'a git
2. SQL Editor'ü aç
3. `supabase/migrations/2025-11-22-separate-theme-modes.sql` dosyasının içeriğini kopyala
4. SQL Editor'e yapıştır ve çalıştır

Bu migration:
- Yeni sütunları ekler (eğer yoksa)
- Mevcut `theme_mode` değerini her iki yeni sütuna kopyalar
- Check constraint'leri ekler (eğer yoksa)
- İdempotent'tır (birden fazla kez çalıştırılabilir)

### Adım 2: Dev Server'ı Yeniden Başlat
```powershell
# Önce durdur (Ctrl+C)
# Sonra tekrar başlat
npm run dev
```

### Adım 3: Test Et
1. Web uygulamasında ayarlar sayfasına git
2. Koyu tema seç
3. Sayfayı yenile (F5)
4. Tema koyu kalmalı
5. Çıkış yap ve tekrar giriş yap
6. Tema hala koyu olmalı

### Adım 4: Mobil Uygulamayı Test Et
1. Mobil uygulamada Ayarlar'a git
2. Açık tema seç
3. Uygulamayı kapat ve tekrar aç
4. Tema açık kalmalı
5. Web'de seçtiğin koyu tema mobili etkilememeli

## Beklenen Sonuç
- Web: Koyu tema
- Mobil: Açık tema
- İkisi birbirinden bağımsız çalışmalı

## Sorun Giderme

### Tema hala senkronize oluyor
1. Migration'ın başarıyla çalıştığını kontrol et:
   ```sql
   SELECT column_name
   FROM information_schema.columns
   WHERE table_name = 'user_preferences'
   AND column_name IN ('theme_mode_web', 'theme_mode_mobile');
   ```
   İki satır görmeli: `theme_mode_web` ve `theme_mode_mobile`

2. Mevcut kullanıcının değerlerini kontrol et:
   ```sql
   SELECT theme_mode, theme_mode_web, theme_mode_mobile
   FROM user_preferences
   WHERE user_id = '<kullanıcı-id>';
   ```

3. Browser cache'i temizle:
   - DevTools aç (F12)
   - Application tab
   - Clear storage

### Eski tema değerleri görünüyor
Eğer eski `theme_mode` sütunu karışıklık yaratıyorsa, cleanup migration'ı çalıştır:
```sql
-- supabase/migrations/2025-11-22-cleanup-old-theme-column.sql
UPDATE user_preferences
SET theme_mode = theme_mode_web
WHERE theme_mode IS DISTINCT FROM theme_mode_web;
```

Veya tamamen kaldır (ÖNERİLMEZ - backward compatibility):
```sql
ALTER TABLE user_preferences DROP COLUMN IF EXISTS theme_mode;
```

## Teknik Detaylar

### Neden İki Ayrı Sütun?
Önceden tek bir `theme_mode` sütunu vardı. Bu, web ve mobilde aynı temayı kullanmaya zorluyordu. Şimdi:
- Web: `theme_mode_web` (light/dark)
- Mobil: `theme_mode_mobile` (light/dark/system)

### Neden `system` Sadece Mobilde?
Mobil cihazlar genellikle sistem çapında koyu/açık mod ayarına sahip. Web'de bu özellik standart değil.

### Eski Sütun Ne Oldu?
`theme_mode` sütunu backward compatibility için korundu. Cleanup migration ile web teması ile senkronize ediliyor veya tamamen kaldırılabilir.
