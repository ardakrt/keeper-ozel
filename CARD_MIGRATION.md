# Kart Depolama Migration Dokümantasyonu

## Özet

Bu migration, Keeper uygulamasındaki kart depolama sistemini tamamen Basis Theory token tabanlı sisteme geçirir. Eski şifreli format artık desteklenmemektedir.

## Değişiklikler

### 1. Database Değişiklikleri

**Silinen:**
- `card_number_enc` kolonu (artık kullanılmıyor)
- `bt_token_id` NULL olan tüm kartlar (eski format)

**Zorunlu Hale Getirilen:**
- `bt_token_id` (NOT NULL)
- `last_four` (NOT NULL)
- `card_brand` (NOT NULL)

**Eklenen Kısıtlamalar:**
- `last_four` tam olarak 4 rakam olmalı
- `card_brand` sadece şu değerleri alabilir: 'visa', 'mastercard', 'troy', 'amex', 'unknown'

### 2. Kod Değişiklikleri

**Yeni Type Tanımları:**
- `types/card.ts` - Unified Card type tanımı
- Web ve mobile için tek bir Card interface

**Güncellenen Componentler:**
- `components/CardItem.tsx` - CardDisplay type kullanıyor
- `components/CardList.tsx` - CardDisplay type kullanıyor
- `components/CardsPageManager.tsx` - CardDisplay type kullanıyor

**Güncellenen Actions:**
- `app/actions.ts` - updateCard fonksiyonu yeniden yazıldı, artık kart numarası değiştiğinde yeni token oluşturuyor

## Migration Nasıl Çalıştırılır

### Adım 1: Veritabanı Yedeği Alın
```bash
# Önce mevcut kartların yedeğini alın
# Supabase Dashboard'da SQL Editor'dan:
SELECT * FROM cards;
```

### Adım 2: Migration'ı Çalıştırın

Supabase CLI kullanıyorsanız:
```bash
npx supabase migration up
```

Veya Supabase Dashboard'da SQL Editor'dan dosya içeriğini çalıştırın:
```sql
-- supabase/migrations/cleanup_old_card_format.sql içeriğini buraya yapıştırın
```

### Adım 3: Uygulamayı Test Edin

1. Yeni kart ekleyin
2. Mevcut kartları görüntüleyin
3. Kart düzenleme işlevini test edin
4. Kart silme işlevini test edin

## Önemli Notlar

⚠️ **UYARI:** Bu migration geri döndürülemez! Eski formatdaki kartlar silinecektir.

### Kullanıcılar için:
- Eski formattaki kartlar (card_number_enc olan) silinecek
- Kullanıcıların kartlarını yeniden eklemesi gerekebilir
- Basis Theory token'ı olmayan kartlar otomatik silinir

### Geliştiriciler için:
- Artık tüm kartlar Basis Theory üzerinden yönetiliyor
- `card_number_enc` artık kullanılmıyor
- `bt_token_id` her zaman zorunlu
- `revealCard()` fonksiyonu ile kart numarası görüntülenebilir

## Web ve Mobile Uyumluluğu

Bu değişikliklerle artık:
- ✅ Web ve mobile aynı veri formatını kullanıyor
- ✅ Tek bir Card type tanımı var
- ✅ Basis Theory token'ları her iki platformda çalışıyor
- ✅ Güvenlik seviyesi artırıldı (tokenization)

## Rollback (Geri Alma)

Bu migration geri alınamaz çünkü eski kartlar siliniyor. Eğer geri dönmek isterseniz:
1. Veritabanı yedeğinizi geri yükleyin
2. Yeni migration'ı çalıştırmayın
3. Kodda yapılan değişiklikleri git ile geri alın

## İletişim

Sorularınız için proje yöneticisi ile iletişime geçin.
