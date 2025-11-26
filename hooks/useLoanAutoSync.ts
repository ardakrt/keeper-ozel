"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

/**
 * Smart Loan Synchronizer Hook
 *
 * Automatically updates loan installment counts based on elapsed time.
 * Runs once on mount and syncs all active loans with the database.
 *
 * Logic:
 * 1. Fetch all active loans from Supabase
 * 2. Calculate expected paid installments based on:
 *    - Start date
 *    - Current date
 *    - Payment day of month
 * 3. Update database if calculated > current
 * 4. Auto-complete loans when all installments are paid
 *
 * @example
 * ```tsx
 * // In your main layout or dashboard
 * import { useLoanAutoSync } from '@/hooks/useLoanAutoSync';
 *
 * export default function Layout() {
 *   useLoanAutoSync(); // Runs automatically
 *   return <YourApp />;
 * }
 * ```
 */
export function useLoanAutoSync() {
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution in development (React Strict Mode)
    if (hasRun.current) return;
    hasRun.current = true;

    syncLoans();
  }, []);

  const syncLoans = async () => {
    try {
      const supabase = createBrowserClient();

      // 1. Fetch all active loans
      const { data: loans, error: fetchError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("type", "loan")
        .eq("status", "active");

      if (fetchError) {
        console.error("[LoanAutoSync] Fetch error:", fetchError);
        return;
      }

      if (!loans || loans.length === 0) {
        console.log("[LoanAutoSync] No active loans found.");
        return;
      }

      console.log(`[LoanAutoSync] Found ${loans.length} active loan(s). Syncing...`);

      // 2. Calculate and update each loan
      const updatePromises = loans.map(async (loan) => {
        const {
          id,
          start_date,
          created_at,
          payment_date,
          paid_installments,
          total_installments,
        } = loan;

        // Use start_date if available, fallback to created_at
        const startDate = new Date(start_date || created_at);
        const today = new Date();
        const currentDay = today.getDate();
        const paymentDay = payment_date;

        // Calculate expected paid installments
        const expectedPaid = calculateExpectedPaid(startDate, today, paymentDay);

        // 3. Sync if needed
        if (expectedPaid > paid_installments) {
          const actualPaid = Math.min(expectedPaid, total_installments);
          const isCompleted = actualPaid >= total_installments;

          const updateData: any = {
            paid_installments: actualPaid,
          };

          if (isCompleted) {
            updateData.status = "completed";
          }

          const { error: updateError } = await supabase
            .from("subscriptions")
            .update(updateData)
            .eq("id", id);

          if (updateError) {
            console.error(`[LoanAutoSync] Update error for loan ${id}:`, updateError);
          } else {
            console.log(
              `[LoanAutoSync] Updated loan "${loan.name}": ${paid_installments} → ${actualPaid}${
                isCompleted ? " (COMPLETED)" : ""
              }`
            );
          }
        }
      });

      // Execute all updates in parallel
      await Promise.all(updatePromises);
      console.log("[LoanAutoSync] Sync completed successfully.");
    } catch (error) {
      console.error("[LoanAutoSync] Unexpected error:", error);
    }
  };
}

/**
 * Calculate Expected Paid Installments
 *
 * @param startDate - When the loan started
 * @param currentDate - Today's date
 * @param paymentDay - Day of month for payment (1-31)
 * @returns Number of installments that should have been paid by now
 *
 * @example
 * Start: Jan 1, 2024
 * Current: Mar 20, 2024
 * Payment Day: 15
 *
 * Result:
 * - Jan 1 → Feb 1: 1 month passed
 * - Feb 1 → Mar 1: 2 months passed
 * - Current day (20) >= Payment day (15): YES, count this month too
 * - Expected Paid: 3 installments
 */
function calculateExpectedPaid(
  startDate: Date,
  currentDate: Date,
  paymentDay: number
): number {
  // Calculate difference in months
  const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
  const monthDiff = currentDate.getMonth() - startDate.getMonth();
  const totalMonthsPassed = yearDiff * 12 + monthDiff;

  // Check if current month's payment is due
  const currentDay = currentDate.getDate();
  const shouldCountCurrentMonth = currentDay >= paymentDay;

  // Expected paid = months passed + (current month if payment day reached)
  const expectedPaid = totalMonthsPassed + (shouldCountCurrentMonth ? 1 : 0);

  // Never return negative (edge case: if loan starts in the future)
  return Math.max(0, expectedPaid);
}

/**
 * Alternative: Manual Trigger Function
 *
 * Use this if you want to trigger sync manually instead of auto-sync on mount.
 *
 * @example
 * ```tsx
 * import { manualSyncLoans } from '@/hooks/useLoanAutoSync';
 *
 * // In a button or useEffect
 * await manualSyncLoans();
 * ```
 */
export async function manualSyncLoans() {
  try {
    const supabase = createBrowserClient();

    const { data: loans, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("type", "loan")
      .eq("status", "active");

    if (fetchError) throw fetchError;
    if (!loans || loans.length === 0) return;

    const updatePromises = loans.map(async (loan) => {
      const {
        id,
        start_date,
        created_at,
        payment_date,
        paid_installments,
        total_installments,
      } = loan;

      const startDate = new Date(start_date || created_at);
      const today = new Date();
      const currentDay = today.getDate();

      const expectedPaid = calculateExpectedPaid(startDate, today, payment_date);

      if (expectedPaid > paid_installments) {
        const actualPaid = Math.min(expectedPaid, total_installments);
        const isCompleted = actualPaid >= total_installments;

        const updateData: any = {
          paid_installments: actualPaid,
        };

        if (isCompleted) {
          updateData.status = "completed";
        }

        await supabase.from("subscriptions").update(updateData).eq("id", id);
      }
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("[LoanAutoSync] Manual sync error:", error);
    throw error;
  }
}
