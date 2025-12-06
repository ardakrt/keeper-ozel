"use client";

import { useState, useTransition } from "react";
import { createCard } from "@/app/actions";
import { toast } from "react-hot-toast";

export default function NewCardForm({
  onCardCreated,
  onCancel,
  alwaysOpen = false
}: {
  onCardCreated?: () => void;
  onCancel?: () => void;
  alwaysOpen?: boolean;
}) {
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [isOpen, setIsOpen] = useState(alwaysOpen);
  const [isPending, startTransition] = useTransition();

  const onExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setExpiry(formatted);
  };

  const onCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(digits);
  };

  const onCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.match(/.{1,4}/g)?.join(" ") || digits;
    setCardNumber(formatted);
  };

  return (
    <div className={alwaysOpen ? "" : "mb-12"}>
      {!isOpen && !alwaysOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 rounded-xl font-semibold transition-colors duration-200 bg-zinc-900 text-white hover:bg-black flex items-center gap-3 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kart Ekle
        </button>
      )}

      {(isOpen || alwaysOpen) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);

            // Clean card number - remove spaces and non-digits before sending
            const rawCardNumber = formData.get('card_number') as string;
            const cleanedCardNumber = rawCardNumber.replace(/\D/g, '');
            formData.set('card_number', cleanedCardNumber);

            startTransition(async () => {
              try {
                await createCard(formData);
                const { invalidateCache } = await import('@/components/DataPreloader');
                invalidateCache('cards');
                toast.success("Kart başarıyla eklendi!");
                setIsOpen(false);
                setExpiry("");
                setCvv("");
                setCardNumber("");
                if (onCardCreated) {
                  onCardCreated();
                }
              } catch (error) {
                console.error("Kart oluşturma hatası:", error);
                toast.error(error instanceof Error ? error.message : "Kart eklenemedi.");
              }
            });
          }}
          className="bg-black/40 dark:bg-black/40 light:bg-zinc-50/95 backdrop-blur-2xl border border-white/20 dark:border-white/20 light:border-zinc-300/50 rounded-2xl shadow-2xl light:shadow-xl p-10"
        >
          {/* Başlık */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 tracking-tight mb-2">Yeni Kart Ekle</h3>
            <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600 text-sm">Kart bilgilerinizi güvenli bir şekilde kaydedin</p>
          </div>

          {/* Input Alanları */}
          <div className="space-y-5">
            {/* Etiket */}
            <div>
              <label htmlFor="label" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
                Etiket
              </label>
              <input
                id="label"
                name="label"
                type="text"
                autoComplete="off"
                className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white"
                placeholder="Örn: İş Kartım"
                required
              />
            </div>

            {/* Kart Sahibi */}
            <div>
              <label htmlFor="holder_name" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
                Kart Sahibi
              </label>
              <input
                id="holder_name"
                name="holder_name"
                type="text"
                autoComplete="off"
                className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black uppercase dark:bg-white/5 dark:border-white/10 dark:text-white"
                placeholder="İsim Soyisim"
                required
              />
            </div>

            {/* Kart Numarası */}
            <div>
              <label htmlFor="card_number" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
                Kart Numarası
              </label>
              <input
                id="card_number"
                name="card_number"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={cardNumber}
                onChange={onCardNumberChange}
                className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono tracking-wider dark:bg-white/5 dark:border-white/10 dark:text-white"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            {/* Son K.T. ve CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry_date" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
                  Son K.T.
                </label>
                <input
                  id="expiry_date"
                  name="expiry_date"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="MM/YY"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono dark:bg-white/5 dark:border-white/10 dark:text-white"
                  value={expiry}
                  onChange={onExpiryChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="cvv" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
                  CVV
                </label>
                <input
                  id="cvv"
                  name="cvv"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="•••"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono text-center dark:bg-white/5 dark:border-white/10 dark:text-white"
                  value={cvv}
                  onChange={onCvvChange}
                  maxLength={3}
                />
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-100"
            >
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {(onCancel || !alwaysOpen) && (
              <button
                type="button"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  } else {
                    setIsOpen(false);
                  }
                }}
                className="px-8 h-12 bg-white/5 dark:bg-white/5 light:bg-zinc-100 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 border border-white/10 dark:border-white/10 light:border-zinc-300 dark:border-white/10 dark:border-white/10 light:border-zinc-300 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 rounded-xl text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 font-semibold transition-all"
              >
                İptal
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
