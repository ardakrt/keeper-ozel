"use client";

import { useLoanAutoSync } from "@/hooks/useLoanAutoSync";

/**
 * Loan Auto Sync Provider
 *
 * Client component wrapper that runs the loan synchronization hook.
 * Place this in your dashboard layout to automatically sync loans when the app loads.
 *
 * @example
 * ```tsx
 * // In app/dashboard/layout.tsx
 * import LoanAutoSyncProvider from "@/components/LoanAutoSyncProvider";
 *
 * export default function DashboardLayout({ children }) {
 *   return (
 *     <div>
 *       <LoanAutoSyncProvider />
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export default function LoanAutoSyncProvider() {
  // This hook runs once on mount and syncs all loans
  useLoanAutoSync();

  // This component renders nothing - it's just a hook executor
  return null;
}
