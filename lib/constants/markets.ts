export type AssetCategory = 'currency' | 'gold' | 'crypto';

export interface AssetOption {
  symbol: string;
  name: string;
  icon: string;
  color: string;
  category: AssetCategory;
  unit?: string;
}

export const allAssetOptions: AssetOption[] = [
  // Dövizler
  { symbol: 'USD', name: 'Amerikan Doları', icon: '$', color: '#22C55E', category: 'currency', unit: 'adet' },
  { symbol: 'EUR', name: 'Euro', icon: '€', color: '#3B82F6', category: 'currency', unit: 'adet' },
  { symbol: 'GBP', name: 'İngiliz Sterlini', icon: '£', color: '#8B5CF6', category: 'currency', unit: 'adet' },
  { symbol: 'CHF', name: 'İsviçre Frangı', icon: '₣', color: '#EF4444', category: 'currency', unit: 'adet' },
  
  // Altınlar
  { symbol: 'GA', name: 'Gram Altın', icon: '◉', color: '#F59E0B', category: 'gold', unit: 'gram' },
  { symbol: 'C', name: 'Çeyrek Altın', icon: '◎', color: '#F59E0B', category: 'gold', unit: 'adet' },
  { symbol: 'Y', name: 'Yarım Altın', icon: '◐', color: '#F59E0B', category: 'gold', unit: 'adet' },
  { symbol: 'T', name: 'Tam Altın', icon: '●', color: '#F59E0B', category: 'gold', unit: 'adet' },
  { symbol: 'A', name: 'Ata Altın', icon: '◉', color: '#D97706', category: 'gold', unit: 'adet' },
  { symbol: 'R', name: 'Reşat Altın', icon: '◈', color: '#D97706', category: 'gold', unit: 'adet' },
  { symbol: 'H', name: 'Hamit Altın', icon: '◇', color: '#D97706', category: 'gold', unit: 'adet' },
  { symbol: '22A', name: '22 Ayar Bilezik', icon: '○', color: '#F59E0B', category: 'gold', unit: 'gram' },
  { symbol: 'GUMUS', name: 'Gümüş', icon: '◇', color: '#9CA3AF', category: 'gold', unit: 'gram' },
  
  // Kriptolar
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7931A', category: 'crypto', unit: 'adet' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627EEA', category: 'crypto', unit: 'adet' },
  { symbol: 'SOL', name: 'Solana', icon: '◎', color: '#00FFA3', category: 'crypto', unit: 'adet' },
  { symbol: 'AVAX', name: 'Avalanche', icon: 'A', color: '#E84142', category: 'crypto', unit: 'adet' },
  { symbol: 'LINK', name: 'Chainlink', icon: '⬡', color: '#2A5ADA', category: 'crypto', unit: 'adet' },
  { symbol: 'DOT', name: 'Polkadot', icon: '●', color: '#E6007A', category: 'crypto', unit: 'adet' },
  { symbol: 'MATIC', name: 'Polygon', icon: '⬡', color: '#8247E5', category: 'crypto', unit: 'adet' },
  { symbol: 'ADA', name: 'Cardano', icon: '₳', color: '#0033AD', category: 'crypto', unit: 'adet' },
  { symbol: 'XRP', name: 'Ripple', icon: '✕', color: '#23292F', category: 'crypto', unit: 'adet' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', color: '#C2A633', category: 'crypto', unit: 'adet' },
  { symbol: 'SHIB', name: 'Shiba Inu', icon: '🐕', color: '#FFA409', category: 'crypto', unit: 'adet' },
  { symbol: 'UNI', name: 'Uniswap', icon: '🦄', color: '#FF007A', category: 'crypto', unit: 'adet' },
];

export const marketItemConfig: Record<string, { icon: string; color: string; category: 'currency' | 'gold' }> = {
  USD: { icon: '$', color: '#22C55E', category: 'currency' },
  EUR: { icon: '€', color: '#3B82F6', category: 'currency' },
  GBP: { icon: '£', color: '#8B5CF6', category: 'currency' },
  GA: { icon: '◉', color: '#F59E0B', category: 'gold' },
  C: { icon: '◎', color: '#F59E0B', category: 'gold' },
  Y: { icon: '◐', color: '#F59E0B', category: 'gold' },
  T: { icon: '●', color: '#F59E0B', category: 'gold' },
  A: { icon: '◉', color: '#D97706', category: 'gold' },
};
