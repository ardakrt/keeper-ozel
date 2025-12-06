"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import TOTPCodeDisplay from "./TOTPCodeDisplay";
import dynamic from "next/dynamic";
import { revealOTPSecret, deleteOTPCode } from "@/app/actions";
import { getOTPSecretsCache } from "./OTPPreloader";

const QRImportScanner = dynamic(() => import("./QRImportScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-white/70 dark:text-white/70 light:text-zinc-600">
      <div className="w-12 h-12 border-4 border-white/10 dark:border-white/10 light:border-zinc-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
      Kamera modülü yükleniyor...
    </div>
  ),
});

type OTPCode = {
  id: string;
  service_name: string;
  account_name: string | null;
  issuer: string | null;
  bt_token_id_secret: string;
  icon_url: string | null;
  color: string | null;
  category: string | null;
  algorithm: string;
  digits: number;
  period: number;
  notes: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

interface AuthenticatorPageManagerProps {
  otpCodes: OTPCode[];
}

export default function AuthenticatorPageManager({ otpCodes }: AuthenticatorPageManagerProps) {
  const [view, setView] = useState<"list" | "import">("list");
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load secrets progressively with global caching
  useEffect(() => {
    if (otpCodes.length === 0) return;

    const loadSecrets = async () => {
      const secretCache = getOTPSecretsCache(); // Use global cache
      const initialSecrets: Record<string, string> = {};
      const initialLoading: Record<string, boolean> = {};

      // Check global cache first (may already be preloaded!)
      for (const code of otpCodes) {
        const cached = secretCache.get(code.bt_token_id_secret);
        if (cached) {
          initialSecrets[code.id] = cached;
          initialLoading[code.id] = false;
        } else {
          initialLoading[code.id] = true;
        }
      }

      // Set cached secrets immediately (instant if preloaded!)
      setSecrets(initialSecrets);
      setLoading(initialLoading);

      // Load non-cached secrets progressively
      otpCodes.forEach(async (code) => {
        if (secretCache.has(code.bt_token_id_secret)) return; // Skip cached

        try {
          const secret = await revealOTPSecret(code.bt_token_id_secret);

          // Cache it globally
          secretCache.set(code.bt_token_id_secret, secret);

          // Update state immediately as each secret loads
          setSecrets((prev) => ({ ...prev, [code.id]: secret }));
          setLoading((prev) => ({ ...prev, [code.id]: false }));
        } catch (error) {
          console.error(`Failed to load secret for ${code.service_name}:`, error);
          setLoading((prev) => ({ ...prev, [code.id]: false }));
        }
      });
    };

    loadSecrets();
  }, [otpCodes]);

  const handleDelete = async (id: string, btTokenId: string) => {
    if (!confirm("Bu 2FA kodunu silmek istediğinizden emin misiniz?")) return;

    setDeletingId(id);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("bt_token_id", btTokenId);
      await deleteOTPCode(formData);

      // Remove from global cache
      const secretCache = getOTPSecretsCache();
      secretCache.delete(btTokenId);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("2FA kodu silinemedi");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fadeIn w-full max-w-6xl mx-auto">
      {/* Header Panel */}
      <motion.div
        layout
        transition={{ duration: 0.3 }}
        className="w-full min-h-[600px] flex flex-col rounded-3xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-black/20 dark:bg-black/20 light:bg-white/90 backdrop-blur-sm overflow-hidden light:shadow-xl"
      >
        {/* Header Section */}
        <div className="p-8 border-b border-white/5 dark:border-white/5 light:border-zinc-200">
          <div className="flex items-center justify-between mb-6">
            {/* Left Side - Title */}
            <div>
              <h1 className="text-2xl font-bold text-white dark:text-white light:text-zinc-900">
                Authenticator
              </h1>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-zinc-500 mt-1">
                2FA kodlarınızı güvenle yönetin
              </p>
            </div>

            {/* Right Side - Action Buttons */}
            {view === "list" && (
              <button
                onClick={() => setView("import")}
                className="bg-white/5 dark:bg-white/5 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 border border-white/10 dark:border-white/10 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                İçe Aktar
              </button>
            )}

            {view !== "list" && (
              <button
                onClick={() => setView("list")}
                className="bg-white/5 dark:bg-white/5 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 border border-white/10 dark:border-white/10 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Geri Dön
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1">
          {view === "list" && (
            <div>
              {otpCodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h2 className="text-xl font-semibold text-white dark:text-white light:text-zinc-900 mb-2">
                    Henüz 2FA kodunuz yok
                  </h2>
                  <p className="text-sm text-white/60 dark:text-white/60 light:text-zinc-500 mb-6 max-w-md">
                    Google Authenticator&apos;daki tüm kodlarınızı tek QR ile ekleyin
                  </p>
                  <button
                    onClick={() => setView("import")}
                    className="bg-white/5 dark:bg-white/5 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 border border-white/10 dark:border-white/10 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 transition-all flex items-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    Toplu İçe Aktar
                  </button>
               
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {otpCodes.map((code) => {
                    const secret = secrets[code.id];
                    const isLoading = loading[code.id];
                    const isDeleting = deletingId === code.id;

                    return (
                      <motion.div
                        key={code.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        {isLoading ? (
                          <div className="rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-white/5 dark:bg-white/5 light:bg-zinc-50 p-3 shadow-sm dark:shadow-none">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Circular icon skeleton */}
                                <div className="w-14 h-14 rounded-full bg-white/10 dark:bg-white/10 light:bg-zinc-200 animate-pulse" />
                                <div className="space-y-2">
                                  {/* Service name skeleton */}
                                  <div className="h-4 w-24 bg-white/10 dark:bg-white/10 light:bg-zinc-200 rounded animate-pulse" />
                                  {/* Account skeleton */}
                                  <div className="h-3 w-32 bg-white/10 dark:bg-white/10 light:bg-zinc-200 rounded animate-pulse" />
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {/* Code skeleton */}
                                <div className="h-8 w-24 bg-white/10 dark:bg-white/10 light:bg-zinc-200 rounded animate-pulse" />
                                {/* Button skeletons */}
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-white/10 dark:bg-white/10 light:bg-zinc-200 animate-pulse" />
                                  <div className="w-8 h-8 rounded-lg bg-white/10 dark:bg-white/10 light:bg-zinc-200 animate-pulse" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : secret ? (
                          <TOTPCodeDisplay
                            id={code.id}
                            secret={secret}
                            serviceName={code.service_name}
                            accountName={code.account_name || undefined}
                            issuer={code.issuer || undefined}
                            algorithm={code.algorithm as "SHA1" | "SHA256" | "SHA512"}
                            digits={code.digits}
                            period={code.period}
                            iconUrl={code.icon_url || undefined}
                            color={code.color || undefined}
                            onDelete={() => handleDelete(code.id, code.bt_token_id_secret)}
                            isDeleting={isDeleting}
                          />
                        ) : (
                          <div className="text-center py-8 text-red-400 rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-white/5 dark:bg-white/5 light:bg-white">
                            <p className="text-sm">Secret yüklenemedi</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {view === "import" && (
            <QRImportScanner onSuccess={() => setView("list")} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
