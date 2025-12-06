"use client";

import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";

// Kart numarası maskeleme - server side rendering olduğu için burada yapılabilir
function maskCardNumber(lastFour: string | undefined | null): string {
  if (!lastFour) return "•••• •••• •••• ••••";
  return `•••• •••• •••• ${lastFour}`;
}

function formatExpiryDate(expiry: string): string {
  if (!expiry) return "••/••";
  const cleaned = expiry.replace(/\D/g, "");
  if (cleaned.length >= 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return expiry;
}

export default function WalletWidget() {
  const { cards, user } = useAppStore();
  const card = cards && cards.length > 0 ? cards[0] : null;
  const userName = user?.user_metadata?.name || null;

  // Card verisi artık güvenli view'dan geliyor, masked_card_number olabilir
  const cardNumberDisplay = card?.masked_card_number || maskCardNumber(card?.last_four);

  return (
    <div className="group lg:col-span-2 relative h-full min-h-[240px] [perspective:1000px]">
      <Link href="/dashboard/wallet" className="block w-full h-full">
        <div className="relative w-full h-full transition-transform duration-500 hover:scale-[1.02] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
          {card ? (
            <div className="absolute inset-0 w-full h-full rounded-[1.5rem] p-8 flex flex-col justify-between overflow-hidden border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-white to-zinc-100 dark:from-black/40 dark:to-black/40 backdrop-blur-xl transition-all duration-500">
              {/* Ambient Glow */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              {/* Texture / Noise */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.15] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

              {/* Top Row: Chip & Contactless */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="w-12 h-9 rounded-md bg-gradient-to-b from-[#e2c56b] to-[#bfa148] relative overflow-hidden shadow-sm border border-[#967d34]/50">
                  <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,#000_1px,#000_2px)] mix-blend-overlay"></div>
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-black/10 rounded-sm"></div>
                </div>
                <svg className="w-7 h-7 text-zinc-400 dark:text-white/60 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 5-5v10zm6 0l-5-5 5-5v10z" />
                </svg>
              </div>

              {/* Card Number */}
              <div className="relative z-10 mt-6">
                <p className="text-2xl md:text-3xl font-mono text-zinc-800 dark:text-zinc-100 tracking-widest drop-shadow-sm" style={{ textShadow: "0px 1px 0px rgba(255,255,255,0.5)" }}>
                  {cardNumberDisplay}
                </p>
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 flex justify-between items-end mt-auto">
                <div>
                  <p className="text-[0.6rem] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1 font-medium">KART SAHİBİ</p>
                  <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-200 font-medium tracking-wide uppercase">
                    {card.holder_name_enc?.toUpperCase() || (userName ? userName.toUpperCase() : "KULLANICI")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[0.55rem] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-0.5">SKT</p>
                    <p className="text-sm font-mono text-zinc-700 dark:text-zinc-200">
                      {card.exp_month_enc && card.exp_year_enc ? `${card.exp_month_enc}/${card.exp_year_enc}` : "••/••"}
                    </p>
                  </div>
                  <div className="relative w-10 h-6 opacity-80">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-zinc-400/30 dark:bg-white/30 backdrop-blur-sm border border-white/20 dark:border-white/10"></div>
                    <div className="absolute right-0 top-0 w-6 h-6 rounded-full bg-zinc-400/30 dark:bg-white/30 backdrop-blur-sm border border-white/20 dark:border-white/10"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full rounded-[1.5rem] p-8 flex flex-col items-center justify-center overflow-hidden bg-white/70 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/[0.08] hover:border-emerald-500/40 dark:hover:border-emerald-500/30 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
              {/* Glow Effect on Hover */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <CreditCard className="w-8 h-8 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Henüz kart eklenmedi</h3>
                  <p className="text-sm text-zinc-500 max-w-xs">İlk kartını eklemek için buraya tıkla</p>
                </div>
                <div className="mt-2 w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:scale-110 transition-all duration-300">
                  <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-500" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
