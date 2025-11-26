import CardItem from "@/components/CardItem";
import type { CardDisplay } from "@/types/card";

export default function CardList({ cards, onRefresh }: { cards: CardDisplay[] | null; onRefresh?: () => void }) {
  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-white/20 dark:text-white/20 light:text-zinc-300 mb-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="text-white dark:text-white light:text-zinc-900 font-semibold text-lg">Henüz bir kart kaydetmemişsiniz</h3>
          <p className="text-white/60 dark:text-white/60 light:text-zinc-600 text-sm mt-2">Yeni Kart Ekle butonuna tıklayarak başlayın</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <CardItem key={(card.id ?? idx).toString()} card={card} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
