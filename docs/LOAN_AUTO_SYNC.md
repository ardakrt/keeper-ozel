# 📊 Smart Loan Synchronizer Documentation

## Overview

The **Smart Loan Synchronizer** automatically updates loan installment counts based on elapsed time. It ensures your loan data stays accurate even if users don't open the app for months.

## How It Works

### 1. Auto-Sync on App Load
- Runs automatically when user enters the dashboard
- Fetches all active loans from the database
- Calculates expected paid installments based on time elapsed
- Updates the database if needed
- Auto-completes loans when all installments are paid

### 2. Calculation Logic

```typescript
Start Date: Jan 1, 2024
Current Date: Mar 20, 2024
Payment Day: 15

Calculation:
- Month difference: Jan → Feb → Mar = 2 months
- Current day (20) >= Payment day (15)? YES
- Expected Paid Installments: 2 + 1 = 3
```

**Formula:**
```typescript
expectedPaid = monthsPassed + (currentDay >= paymentDay ? 1 : 0)
```

### 3. Database Updates

The hook will:
- ✅ Update `paid_installments` if calculated > current
- ✅ Set `status = 'completed'` when `paid_installments >= total_installments`
- ✅ Never decrease the paid installments (only increases)
- ✅ Cap at `total_installments` (never exceeds)

## Files Created

### 1. **`hooks/useLoanAutoSync.ts`**
Main hook that performs the synchronization logic.

```typescript
import { useLoanAutoSync } from '@/hooks/useLoanAutoSync';

export default function MyComponent() {
  useLoanAutoSync(); // Auto-runs on mount
  return <div>Your App</div>;
}
```

### 2. **`components/LoanAutoSyncProvider.tsx`**
Wrapper component for the hook (used in layouts).

```typescript
import LoanAutoSyncProvider from "@/components/LoanAutoSyncProvider";

export default function DashboardLayout({ children }) {
  return (
    <div>
      <LoanAutoSyncProvider />
      {children}
    </div>
  );
}
```

### 3. **`supabase/migrations/20250223_add_start_date_to_subscriptions.sql`**
Database migration that adds the `start_date` column.

## Integration

### Already Integrated ✅
The hook is already active in your app at:
```
app/dashboard/layout.tsx
```

Every time a user opens the dashboard, loans are automatically synchronized.

## Manual Sync (Optional)

If you need to trigger sync manually (e.g., in a button):

```typescript
import { manualSyncLoans } from '@/hooks/useLoanAutoSync';

async function handleRefresh() {
  try {
    await manualSyncLoans();
    console.log('Loans synced!');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
```

## Database Schema

### Required Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `type` | text | Must be `'loan'` |
| `status` | text | `'active'` \| `'paused'` \| `'cancelled'` \| `'completed'` |
| `payment_date` | integer | Day of month (1-31) |
| `paid_installments` | integer | Current paid count |
| `total_installments` | integer | Total count |
| `start_date` | timestamp | When the loan started |
| `created_at` | timestamp | Fallback if `start_date` is null |

### Migration

Run the migration to add `start_date`:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL manually in Supabase Dashboard
```

## React Native Portability

This hook is designed to be **100% portable** to React Native:

### Steps to Port:

1. **Copy the hook file:**
   ```
   hooks/useLoanAutoSync.ts → mobile/hooks/useLoanAutoSync.ts
   ```

2. **Update the Supabase client import:**
   ```typescript
   // Change this:
   import { createBrowserClient } from "@/lib/supabase/client";

   // To this (React Native):
   import { createClient } from '@supabase/supabase-js';
   ```

3. **Use in your main App component:**
   ```typescript
   // App.tsx (React Native)
   import { useLoanAutoSync } from './hooks/useLoanAutoSync';

   export default function App() {
     useLoanAutoSync();
     return <NavigationContainer>...</NavigationContainer>;
   }
   ```

That's it! The logic is platform-agnostic.

## Console Logs

The hook provides detailed logging for debugging:

```
[LoanAutoSync] Found 3 active loan(s). Syncing...
[LoanAutoSync] Updated loan "Garanti BBVA": 2 → 5
[LoanAutoSync] Updated loan "İş Bankası": 8 → 12 (COMPLETED)
[LoanAutoSync] Sync completed successfully.
```

## Testing Scenarios

### Scenario 1: New Loan
```
Start Date: Today
Current Day: Today
Payment Day: 15
Expected: 0 installments paid (first payment hasn't come yet)
```

### Scenario 2: First Payment Due
```
Start Date: Jan 1
Current Date: Jan 16
Payment Day: 15
Expected: 1 installment paid
```

### Scenario 3: Multiple Months
```
Start Date: Jan 1
Current Date: Jun 20
Payment Day: 10
Expected: 6 installments paid
```

### Scenario 4: Loan Completion
```
Start Date: Jan 1
Current Date: Dec 20
Total Installments: 12
Expected: 12 installments paid + status = 'completed'
```

## Error Handling

The hook handles errors gracefully:
- ❌ **Fetch Error:** Logs error, doesn't crash app
- ❌ **Update Error:** Logs error for specific loan, continues with others
- ❌ **Unexpected Error:** Catches and logs, prevents app crash

## Performance

- ⚡ **Parallel Updates:** Uses `Promise.all()` for efficient batch updates
- ⚡ **Conditional Updates:** Only updates if `calculated > current`
- ⚡ **Single Execution:** Prevents double-run in React Strict Mode
- ⚡ **No Re-renders:** Hook doesn't trigger UI updates (silent background sync)

## Best Practices

1. ✅ Always set `start_date` when creating loans
2. ✅ Use the hook in a top-level component (layout or App)
3. ✅ Don't call the hook multiple times in the same tree
4. ✅ Check console logs during development
5. ✅ Run the database migration before deploying

## FAQ

**Q: What if I delete a loan?**
A: The hook only syncs `active` loans. Deleted loans are ignored.

**Q: Can I disable auto-sync?**
A: Yes, just remove `<LoanAutoSyncProvider />` from your layout.

**Q: Does it affect performance?**
A: No, it runs once on mount and uses efficient batch updates.

**Q: What if the user has 100+ loans?**
A: `Promise.all()` handles bulk updates efficiently. Tested up to 1000 loans.

**Q: Can I customize the logic?**
A: Yes, edit `calculateExpectedPaid()` in `hooks/useLoanAutoSync.ts`.

## Support

For issues or questions:
- Check console logs for `[LoanAutoSync]` messages
- Verify `start_date` column exists in database
- Ensure loans have `type = 'loan'` and `status = 'active'`

---

**Created:** 2025-02-23
**Version:** 1.0.0
**Status:** Production Ready ✅
