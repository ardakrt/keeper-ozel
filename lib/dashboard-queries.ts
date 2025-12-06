import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revealOTPSecret } from "@/app/actions";

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getRecentNote(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notes")
    .select("title, content, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getSubscriptionsTotal(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("amount, billing_cycle")
    .eq("user_id", userId)
    .eq("type", "subscription");

  if (!data) return 0;

  return data.reduce((acc: number, sub: any) => {
    let amount = sub.amount || 0;
    if (sub.billing_cycle === "yearly") amount /= 12;
    else if (sub.billing_cycle === "weekly") amount *= 4.33;
    else if (sub.billing_cycle === "daily") amount *= 30;
    return acc + amount;
  }, 0);
}

export async function getFirstCard(userId: string) {
  const supabase = await createSupabaseServerClient();
  // Güvenli view'dan çekiyoruz (önceki adımdaki güvenlik yaması)
  const { data } = await supabase
    .from("safe_wallet_view")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getFirstOTPCode(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("user_id", userId)
    .order("order_index", { ascending: true })
    .limit(1)
    .single();
  return data;
}
