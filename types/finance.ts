/**
 * Finance Manager Type Definitions
 * Subscriptions & Loans tracking
 */

export type SubscriptionType = 'subscription' | 'loan';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'completed';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  type: SubscriptionType;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  payment_date: number; // Day of month (1-31)
  total_installments: number | null; // For loans only
  paid_installments: number | null; // For loans only
  linked_card_details: string | null; // e.g., "Garanti **** 1234"
  start_date: string | null; // Start date for loans (for auto-sync)
  logo_url: string | null;
  color: string | null; // Brand color in hex
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Extended Subscription with computed properties for UI
 */
export interface SubscriptionWithComputed extends Subscription {
  daysLeft: number; // Days until next payment
}

/**
 * Summary statistics for the finance dashboard
 */
export interface FinanceSummary {
  totalMonthly: number;
  activeCount: number;
  nextPayment: SubscriptionWithComputed | null;
}

/**
 * Helper to calculate days left until next payment
 */
export function calculateDaysLeft(paymentDate: number): number {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Create target date for this month
  let targetDate = new Date(currentYear, currentMonth, paymentDate);

  // If payment date has passed this month, calculate for next month
  if (currentDay > paymentDate) {
    targetDate = new Date(currentYear, currentMonth + 1, paymentDate);
  }

  // Handle edge case: payment date doesn't exist in target month (e.g., Feb 30)
  if (targetDate.getDate() !== paymentDate) {
    // Set to last day of the month
    targetDate = new Date(currentYear, currentMonth + 1, 0);
  }

  // Calculate difference in days
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Add computed properties to subscription
 */
export function enrichSubscription(subscription: Subscription): SubscriptionWithComputed {
  return {
    ...subscription,
    daysLeft: calculateDaysLeft(subscription.payment_date),
  };
}

/**
 * Calculate summary statistics
 */
export function calculateSummary(subscriptions: Subscription[]): FinanceSummary {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const enrichedSubscriptions = activeSubscriptions.map(enrichSubscription);

  // Calculate total monthly amount (convert yearly to monthly)
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
    const monthlyAmount = sub.billing_cycle === 'yearly'
      ? sub.amount / 12
      : sub.amount;
    return sum + monthlyAmount;
  }, 0);

  // Find next payment (smallest positive daysLeft)
  const upcomingPayments = enrichedSubscriptions
    .filter(s => s.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const nextPayment = upcomingPayments.length > 0 ? upcomingPayments[0] : null;

  return {
    totalMonthly,
    activeCount: activeSubscriptions.length,
    nextPayment,
  };
}
