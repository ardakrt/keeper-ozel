"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { revealOTPSecret } from "@/app/actions";

// Global cache shared across the app
if (typeof window !== 'undefined') {
  (window as any).__otpSecretsCache = (window as any).__otpSecretsCache || new Map<string, string>();
  (window as any).__otpCodesCache = (window as any).__otpCodesCache || null;
}

export function getOTPSecretsCache(): Map<string, string> {
  if (typeof window === 'undefined') return new Map();
  return (window as any).__otpSecretsCache;
}

export function getOTPCodesCache(): any[] | null {
  if (typeof window === 'undefined') return null;
  return (window as any).__otpCodesCache;
}

export default function OTPPreloader() {
  const preloadOTPSecrets = async () => {
    try {
      const supabase = createBrowserClient();

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch OTP codes
      const { data: otpCodes, error } = await supabase
        .from("otp_codes")
        .select("*")
        .order("order_index", { ascending: true });

      if (error || !otpCodes || otpCodes.length === 0) return;

      // Cache the OTP codes
      (window as any).__otpCodesCache = otpCodes;

      // Load secrets progressively (3 at a time to avoid overwhelming)
      const batchSize = 3;
      for (let i = 0; i < otpCodes.length; i += batchSize) {
        const batch = otpCodes.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (code) => {
            const cache = getOTPSecretsCache();

            // Skip if already cached
            if (cache.has(code.bt_token_id_secret)) return;

            try {
              const secret = await revealOTPSecret(code.bt_token_id_secret);
              cache.set(code.bt_token_id_secret, secret);
            } catch (error) {
              console.error(`Failed to preload secret for ${code.service_name}:`, error);
            }
          })
        );

        // Small delay between batches to keep things smooth
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`✅ Preloaded ${otpCodes.length} OTP secrets in background`);
    } catch (error) {
      console.error("OTP preload failed:", error);
    }
  };

  useEffect(() => {
    // Start preloading after a short delay to not block initial render
    const timer = setTimeout(() => {
      preloadOTPSecrets();
    }, 2000); // Wait 2 seconds after dashboard loads

    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
