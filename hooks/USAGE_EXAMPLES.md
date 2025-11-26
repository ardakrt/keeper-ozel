# 📖 Loan Auto Sync - Usage Examples

## 1️⃣ Basic Usage (Already Implemented)

### In Dashboard Layout
```typescript
// app/dashboard/layout.tsx
import LoanAutoSyncProvider from "@/components/LoanAutoSyncProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Auto-syncs on every dashboard visit */}
      <LoanAutoSyncProvider />
      {children}
    </div>
  );
}
```

## 2️⃣ Manual Trigger

### In a Button Component
```typescript
"use client";

import { useState } from "react";
import { manualSyncLoans } from "@/hooks/useLoanAutoSync";
import { Loader2, RefreshCw } from "lucide-react";

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await manualSyncLoans();
      alert("Krediler güncellendi!");
    } catch (error) {
      alert("Güncelleme başarısız!");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      {syncing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      Kredileri Güncelle
    </button>
  );
}
```

## 3️⃣ With Loading State in UI

### Show Sync Status
```typescript
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { manualSyncLoans } from "@/hooks/useLoanAutoSync";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [syncing, setSyncing] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const init = async () => {
      // Auto-sync first
      await manualSyncLoans();

      // Then load loans
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("type", "loan");

      setLoans(data || []);
      setSyncing(false);
    };

    init();
  }, []);

  if (syncing) {
    return <div>Krediler güncelleniyor...</div>;
  }

  return (
    <div>
      {loans.map((loan) => (
        <div key={loan.id}>
          {loan.name} - {loan.paid_installments}/{loan.total_installments}
        </div>
      ))}
    </div>
  );
}
```

## 4️⃣ React Native Integration

### App.tsx (React Native)
```typescript
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Copy the hook logic (modify Supabase import)
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
  // Auto-sync on app start
  useLoanAutoSync();

  return (
    <NavigationContainer>
      {/* Your navigation here */}
    </NavigationContainer>
  );
}
```

## 5️⃣ Scheduled Background Sync (Advanced)

### Using Next.js API Route
```typescript
// pages/api/sync-loans.ts
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req, res) {
  // Verify auth (use API key or secret)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
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
      "schedule": "0 0 * * *" // Daily at midnight
    }
  ]
}
```

## 6️⃣ Testing Example

### Jest Test Suite
```typescript
// hooks/__tests__/useLoanAutoSync.test.ts
import { calculateExpectedPaid } from '../useLoanAutoSync';

describe('Loan Auto Sync', () => {
  it('calculates correct paid installments', () => {
    const start = new Date('2024-01-01');
    const current = new Date('2024-04-15');
    const paymentDay = 10;

    const result = calculateExpectedPaid(start, current, paymentDay);
    expect(result).toBe(4); // Jan, Feb, Mar, Apr
  });

  it('does not count current month if before payment day', () => {
    const start = new Date('2024-01-01');
    const current = new Date('2024-04-05');
    const paymentDay = 10;

    const result = calculateExpectedPaid(start, current, paymentDay);
    expect(result).toBe(3); // Jan, Feb, Mar (not Apr yet)
  });

  it('handles same month as start', () => {
    const start = new Date('2024-01-01');
    const current = new Date('2024-01-20');
    const paymentDay = 15;

    const result = calculateExpectedPaid(start, current, paymentDay);
    expect(result).toBe(1); // First payment already due
  });
});
```

## 7️⃣ Error Tracking

### With Sentry
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

## 8️⃣ Custom Calculation Logic

### Override Default Calculation
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
        // Custom logic: Every 15 days = 1 payment
        const daysSinceStart = Math.floor(
          (Date.now() - new Date(loan.start_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        const expectedPaid = Math.floor(daysSinceStart / 15);

        if (expectedPaid > loan.paid_installments) {
          await supabase
            .from("subscriptions")
            .update({ paid_installments: expectedPaid })
            .eq("id", loan.id);
        }
      }
    };

    sync();
  }, []);
}
```

---

## 🎯 Best Practices

1. ✅ Use the hook in top-level components (layouts, App.tsx)
2. ✅ Don't call multiple times in the same component tree
3. ✅ Always handle errors gracefully
4. ✅ Add console logs for debugging
5. ✅ Test with various date scenarios
6. ✅ Keep the calculation logic simple and readable

## 🐛 Common Issues

**Issue:** Hook runs twice
**Solution:** It's React Strict Mode. The `useRef` prevents double execution.

**Issue:** Loans not updating
**Solution:** Check `start_date` exists and loan has `status = 'active'`

**Issue:** Wrong installment count
**Solution:** Verify `payment_date` is correct (1-31)

---

**Need Help?** Check `docs/LOAN_AUTO_SYNC.md` for full documentation.
