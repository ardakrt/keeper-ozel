'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Pencil, Trash2, Star } from 'lucide-react';
// We will import SparklineChart dynamically in the parent or just import it here if we accept the bundle size for now.
// To optimize, we should probably dynamic import this component in the parent list.
import SparklineChart from './SparklineChart';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  change24h: number;
  icon: string;
  color: string;
  chartData: { value: number }[];
}

interface AssetRowProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: () => void;
}

export default function AssetRow({ asset, onEdit, onDelete, isInWatchlist, onToggleWatchlist }: AssetRowProps) {
  const value = asset.amount * asset.price;
  const isPositive = asset.change24h >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-zinc-100 transition-all border border-transparent hover:border-white/10 dark:hover:border-white/10 light:hover:border-zinc-200"
    >
      {/* Watchlist Toggle */}
      {onToggleWatchlist && (
        <button
          onClick={onToggleWatchlist}
          className={`p-2 rounded-lg transition-all ${
            isInWatchlist 
              ? 'text-amber-500 bg-amber-500/10' 
              : 'text-zinc-500 hover:text-amber-500 hover:bg-amber-500/10 opacity-0 group-hover:opacity-100'
          }`}
          title={isInWatchlist ? 'Takipten çıkar' : 'Takibe ekle'}
        >
          <Star size={16} fill={isInWatchlist ? 'currentColor' : 'none'} />
        </button>
      )}
      
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
        style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
      >
        {asset.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white dark:text-white light:text-zinc-900 truncate">{asset.name}</p>
        <p className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">{asset.symbol}</p>
      </div>

      <div className="w-24 h-10 hidden sm:block">
        <SparklineChart data={asset.chartData} isPositive={isPositive} />
      </div>

      <div className="text-right min-w-[80px] hidden md:block">
        <p className="font-medium text-white dark:text-white light:text-zinc-900">{asset.amount}</p>
        <p className="text-xs text-zinc-500">{asset.symbol}</p>
      </div>

      <div className="text-right min-w-[100px]">
        <p className="font-semibold text-white dark:text-white light:text-zinc-900">
          ₺{value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(asset)}
          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 transition-all"
          title="Düzenle"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(asset.id)}
          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-all"
          title="Sil"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
