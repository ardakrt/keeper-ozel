import Link from "next/link";

export default function SubscriptionsWidget({ totalCost }: { totalCost: number }) {
  return (
    <Link href="/dashboard/subscriptions" className="group relative bg-white/70 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/[0.08] hover:border-orange-500/40 dark:hover:border-orange-500/30 rounded-[2rem] p-8 flex flex-col justify-center transition-all duration-500 min-h-[180px] backdrop-blur-2xl shadow-xl hover:shadow-2xl overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <h3 className="text-zinc-600 dark:text-zinc-400 font-medium mb-1 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors relative z-10">Abonelikler</h3>
      <div className="flex items-baseline gap-1 relative z-10">
        <span className="text-4xl font-bold text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">
          ₺{totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 relative z-10">aylık toplam</span>
    </Link>
  );
}
