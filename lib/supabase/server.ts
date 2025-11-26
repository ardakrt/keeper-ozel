import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createSupabaseServerClient(
  cookieStoreArg?: ReturnType<typeof cookies>
): Promise<SupabaseClient> {
  const cookieStore = cookieStoreArg ? await (cookieStoreArg as any) : await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        try {
          return (cookieStore as any)?.get?.(name)?.value;
        } catch {
          return undefined;
        }
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          if ("set" in (cookieStore as any)) {
            (cookieStore as any).set({ name, value, ...options });
          }
        } catch {
          // ignore set attempts in RSC where cookies() is read-only
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          if ("set" in (cookieStore as any)) {
            (cookieStore as any).set({ name, value: "", ...options });
          }
        } catch {
          // ignore remove attempts in RSC where cookies() is read-only
        }
      },
    },
  });
}

export function createSupabaseMiddlewareClient(
  req: NextRequest,
  res: NextResponse
): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });
}

export type { SupabaseClient };
