# 📖 Kredi Otomatik Senkronizasyon - Kullanım Örnekleri

## 1️⃣ Temel Kullanım (Zaten Uygulandı)

### Dashboard Layout'unda
```typescript
// app/dashboard/layout.tsx
import LoanAutoSyncProvider from "@/components/LoanAutoSyncProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Her dashboard ziyaretinde otomatik senkronize eder */}
      <LoanAutoSyncProvider />
      {children}
    </div>
  );
}
```

## 2️⃣ Manuel Tetikleme

### Buton Bileşeninde
```typescript
"use client";

import { useState } from "react";
import { manualSyncLoans } from "@/hooks/useLoanAutoSync";
import { Loader2, RefreshCw } from "lucide-react";

export default function SenkronizasyonButonu() {
  const [senkronizeEdiliyor, setSenkronizeEdiliyor] = useState(false);

  const handleSenkronize = async () => {
    setSenkronizeEdiliyor(true);
    try {
      await manualSyncLoans();
      alert("Krediler güncellendi!");
    } catch (error) {
      alert("Güncelleme başarısız!");
    } finally {
      setSenkronizeEdiliyor(false);
    }
  };

  return (
    <button
      onClick={handleSenkronize}
      disabled={senkronizeEdiliyor}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      {senkronizeEdiliyor ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      Kredileri Güncelle
    </button>
  );
}
```

## 3️⃣ UI'da Yüklenme Durumu ile

### Senkronizasyon Durumunu Göster
```typescript
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { manualSyncLoans } from "@/hooks/useLoanAutoSync";

export default function KredilerSayfasi() {
  const [krediler, setKrediler] = useState([]);
  const [senkronizeEdiliyor, setSenkronizeEdiliyor] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const init = async () => {
      // Önce otomatik senkronize et
      await manualSyncLoans();

      // Sonra kredileri yükle
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("type", "loan");

      setKrediler(data || []);
      setSenkronizeEdiliyor(false);
    };

    init();
  }, []);

  if (senkronizeEdiliyor) {
    return <div>Krediler güncelleniyor...</div>;
  }

  return (
    <div>
      {krediler.map((kredi) => (
        <div key={kredi.id}>
          {kredi.name} - {kredi.paid_installments}/{kredi.total_installments}
        </div>
      ))}
    </div>
  );
}
```

## 4️⃣ React Native Entegrasyonu

### App.tsx (React Native)
```typescript
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';

// Supabase client oluştur
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Hook mantığını kopyala (Supabase import'unu değiştir)
function useLoanAutoSync() {
  useEffect(() => {
    const syncLoans = async () => {
      const { data: loans } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("type", "loan")
        .eq("status", "active");

      if (!loans) return;

      const updatePromises = loans.map(async (loan) => {
        const startDate = new Date(loan.start_date || loan.created_at);
        const today = new Date();
        const expectedPaid = calculateExpectedPaid(startDate, today, loan.payment_date);

        if (expectedPaid > loan.paid_installments) {
          const actualPaid = Math.min(expectedPaid, loan.total_installments);
          await supabase
            .from("subscriptions")
            .update({
              paid_installments: actualPaid,
              status: actualPaid >= loan.total_installments ? "completed" : "active"
            })
            .eq("id", loan.id);
        }
      });

      await Promise.all(updatePromises);
    };

    syncLoans();
  }, []);
}

function calculateExpectedPaid(startDate: Date, currentDate: Date, paymentDay: number): number {
  const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
  const monthDiff = currentDate.getMonth() - startDate.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff;
  const shouldCountCurrent = currentDate.getDate() >= paymentDay;
  return Math.max(0, totalMonths + (shouldCountCurrent ? 1 : 0));
}

export default function App() {
  // Uygulama başlangıcında otomatik senkronize et
  useLoanAutoSync();

  return (
    <NavigationContainer>
      {/* Navigasyonunuz burada */}
    </NavigationContainer>
  );
}
```

## 5️⃣ Zamanlanmış Arka Plan Senkronizasyonu (İleri Seviye)

### Next.js API Route Kullanarak
```typescript
// pages/api/sync-loans.ts
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req, res) {
  // Auth doğrula (API key veya secret kullan)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Yetkisiz' });
  }

  const supabase = await createServerClient();

  const { data: loans } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("type", "loan")
    .eq("status", "active");

  let updated = 0;

  for (const loan of loans || []) {
    const startDate = new Date(loan.start_date || loan.created_at);
    const today = new Date();
    const expectedPaid = calculateExpectedPaid(startDate, today, loan.payment_date);

    if (expectedPaid > loan.paid_installments) {
      const actualPaid = Math.min(expectedPaid, loan.total_installments);
      await supabase
        .from("subscriptions")
        .update({
          paid_installments: actualPaid,
          status: actualPaid >= loan.total_installments ? "completed" : "active"
        })
        .eq("id", loan.id);

      updated++;
    }
  }

  res.status(200).json({ synced: updated });
}

function calculateExpectedPaid(startDate: Date, currentDate: Date, paymentDay: number): number {
  const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
  const monthDiff = currentDate.getMonth() - startDate.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff;
  const shouldCountCurrent = currentDate.getDate() >= paymentDay;
  return Math.max(0, totalMonths + (shouldCountCurrent ? 1 : 0));
}
```

### Vercel Cron Job
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/sync-loans",
      "schedule": "0 0 * * *" // Her gece gece yarısı
    }
  ]
}
```

## 6️⃣ Test Örneği

### Jest Test Suite
```typescript
// hooks/__tests__/useLoanAutoSync.test.ts
import { calculateExpectedPaid } from '../useLoanAutoSync';

describe('Kredi Otomatik Senkronizasyon', () => {
  it('doğru ödenen taksitleri hesaplar', () => {
    const baslangic = new Date('2024-01-01');
    const bugun = new Date('2024-04-15');
    const odemeGunu = 10;

    const sonuc = calculateExpectedPaid(baslangic, bugun, odemeGunu);
    expect(sonuc).toBe(4); // Ocak, Şubat, Mart, Nisan
  });

  it('ödeme gününden önceyse mevcut ayı saymaz', () => {
    const baslangic = new Date('2024-01-01');
    const bugun = new Date('2024-04-05');
    const odemeGunu = 10;

    const sonuc = calculateExpectedPaid(baslangic, bugun, odemeGunu);
    expect(sonuc).toBe(3); // Ocak, Şubat, Mart (henüz Nisan değil)
  });

  it('başlangıçla aynı ayı yönetir', () => {
    const baslangic = new Date('2024-01-01');
    const bugun = new Date('2024-01-20');
    const odemeGunu = 15;

    const sonuc = calculateExpectedPaid(baslangic, bugun, odemeGunu);
    expect(sonuc).toBe(1); // İlk ödeme zaten vadesi gelmiş
  });
});
```

## 7️⃣ Hata Takibi

### Sentry ile
```typescript
import * as Sentry from '@sentry/nextjs';
import { useLoanAutoSync } from '@/hooks/useLoanAutoSync';

export default function DashboardLayout({ children }) {
  useEffect(() => {
    const sync = async () => {
      try {
        await manualSyncLoans();
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: 'loan-sync' },
          extra: { timestamp: new Date().toISOString() }
        });
      }
    };

    sync();
  }, []);

  return <div>{children}</div>;
}
```

## 8️⃣ Özel Hesaplama Mantığı

### Varsayılan Hesaplamayı Geçersiz Kıl
```typescript
// hooks/useCustomLoanSync.ts
import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export function useCustomLoanSync() {
  useEffect(() => {
    const sync = async () => {
      const supabase = createBrowserClient();
      const { data: loans } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("type", "loan")
        .eq("status", "active");

      for (const loan of loans || []) {
        // Özel mantık: Her 15 gün = 1 ödeme
        const baslangictanBeriGecenGunler = Math.floor(
          (Date.now() - new Date(loan.start_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        const beklenenOdeme = Math.floor(baslangictanBeriGecenGunler / 15);

        if (beklenenOdeme > loan.paid_installments) {
          await supabase
            .from("subscriptions")
            .update({ paid_installments: beklenenOdeme })
            .eq("id", loan.id);
        }
      }
    };

    sync();
  }, []);
}
```

## 9️⃣ Bildirim Sistemi ile

### Kredi Tamamlandığında Bildirim Gönder
```typescript
"use client";

import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { manualSyncLoans } from '@/hooks/useLoanAutoSync';
import { toast } from 'sonner'; // veya tercih ettiğiniz toast kütüphanesi

export default function KrediSenkronizasyonuBildirimli() {
  useEffect(() => {
    const syncVeBildir = async () => {
      const supabase = createBrowserClient();

      // Senkronizasyondan önce kredileri al
      const { data: oncekiKrediler } = await supabase
        .from("subscriptions")
        .select("id, name, status")
        .eq("type", "loan")
        .eq("status", "active");

      // Senkronize et
      await manualSyncLoans();

      // Senkronizasyondan sonra kredileri kontrol et
      const { data: sonrakiKrediler } = await supabase
        .from("subscriptions")
        .select("id, name, status")
        .eq("type", "loan");

      // Tamamlanan kredileri bul
      const tamamlananKrediler = sonrakiKrediler?.filter(sonraki => {
        const onceki = oncekiKrediler?.find(o => o.id === sonraki.id);
        return onceki?.status === "active" && sonraki.status === "completed";
      });

      // Her tamamlanan kredi için bildirim göster
      tamamlananKrediler?.forEach(kredi => {
        toast.success(`🎉 ${kredi.name} krediniz tamamlandı!`);
      });
    };

    syncVeBildir();
  }, []);

  return null;
}
```

## 🔟 Realtime Güncellemeler ile

### Supabase Realtime ile Canlı Senkronizasyon
```typescript
"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function KredilerRealtimeIle() {
  const [krediler, setKrediler] = useState([]);
  const supabase = createBrowserClient();

  useEffect(() => {
    // İlk yükleme
    const yukle = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("type", "loan");
      setKrediler(data || []);
    };

    yukle();

    // Realtime subscription
    const channel = supabase
      .channel('krediler')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: 'type=eq.loan'
        },
        (payload) => {
          console.log('Kredi güncellendi:', payload);
          yukle(); // Kredileri yeniden yükle
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      {krediler.map((kredi) => (
        <div key={kredi.id}>
          {kredi.name} - {kredi.paid_installments}/{kredi.total_installments}
          {kredi.status === 'completed' && ' ✅'}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 En İyi Uygulamalar

1. ✅ Hook'u üst seviye bileşenlerde kullanın (layout'lar, App.tsx)
2. ✅ Aynı bileşen ağacında birden fazla kez çağırmayın
3. ✅ Hataları her zaman zarif şekilde yönetin
4. ✅ Hata ayıklama için console logları ekleyin
5. ✅ Çeşitli tarih senaryolarıyla test edin
6. ✅ Hesaplama mantığını basit ve okunabilir tutun

## 🐛 Yaygın Sorunlar

**Sorun:** Hook iki kez çalışıyor
**Çözüm:** React Strict Mode. `useRef` çift çalıştırmayı önler.

**Sorun:** Krediler güncellenmiyor
**Çözüm:** `start_date` var mı ve kredinin `status = 'active'` mi kontrol edin

**Sorun:** Yanlış taksit sayısı
**Çözüm:** `payment_date`'in doğru olduğunu doğrulayın (1-31)

---

**Yardıma mı ihtiyacınız var?** Tam dokümantasyon için `docs/KREDI_OTOMATIK_SENKRONIZASYON.md` dosyasına bakın.
