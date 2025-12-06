"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export type PreloadData = {
  user: User | null;
  wallets: any[];
  notes: any[];
  files: any[];
  cards: any[];
  ibans: any[];
  accounts: any[];
  todos: any[];
  reminders: any[];
};

// Cached data fetcher wrapper (Direct fetch, no cache to fix stale data on F5)
const getCachedUserData = async (userId: string) => {
    // Use Service Role key to avoid using cookies() inside cache
    // This bypasses RLS, so we MUST manually filter by user_id
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Parallel fetch for data only (user is already known)
    const [
      walletsResult,
      notesResult,
      filesResult,
      cardsResult,
      ibansResult,
      accountsResult,
      todosResult,
      remindersResult
    ] = await Promise.all([
      supabase.from("wallets").select("*").eq("user_id", userId),
      supabase.from("notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("files").select("*").eq("user_id", userId),
      supabase.from("cards").select("*").eq("user_id", userId),
      supabase.from("ibans").select("*").eq("user_id", userId),
      supabase.from("accounts").select("*").eq("user_id", userId),
      supabase.from("todos").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("reminders").select("*").eq("user_id", userId).order("due_at", { ascending: true }),
    ]);

    return {
      wallets: walletsResult.data || [],
      notes: notesResult.data || [],
      files: filesResult.data || [],
      cards: cardsResult.data || [],
      ibans: ibansResult.data || [],
      accounts: accountsResult.data || [],
      todos: todosResult.data || [],
      reminders: remindersResult.data || [],
    };
};

export async function fetchAllUserData(): Promise<PreloadData> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      wallets: [],
      notes: [],
      files: [],
      cards: [],
      ibans: [],
      accounts: [],
      todos: [],
      reminders: [],
    };
  }

  // Fetch cached data
  const cachedData = await getCachedUserData(user.id);

  return {
    user,
    ...cachedData
  };
}

// Exposed function to warm the cache (e.g., from login action)
export async function preloadUserData(userId: string) {
  // Fire and forget the cache warming
  getCachedUserData(userId);
}