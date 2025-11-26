"use client";

import { useState, useTransition } from "react";
import { createReminder } from "@/app/actions";

interface NewReminderFormProps {
  onReminderCreated?: () => void;
  onCancel?: () => void;
}

export default function NewReminderForm({ onReminderCreated, onCancel }: NewReminderFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await createReminder(formData);
            const { invalidateCache } = await import('@/components/DataPreloader');
            invalidateCache('reminders');
            if (onReminderCreated) {
              onReminderCreated();
            }
          } catch (e: any) {
            console.error("Hatırlatma oluşturma hatası:", e);
            setError(e.message || "Hatırlatma oluşturulamadı");
          }
        });
      }}
      className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-zinc-50/95 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300/50 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl light:shadow-xl"
    >
      {/* Başlık */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 tracking-tight mb-2">Yeni Hatırlatma Ekle</h3>
        <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600 text-sm">Önemli etkinliklerinizi ve hatırlatmalarınızı planlayın</p>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Input Alanları */}
      <div className="space-y-5">
        {/* Başlık */}
        <div>
          <label htmlFor="title" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
            Hatırlatma Başlığı
          </label>
          <input
            id="title"
            name="title"
            type="text"
            autoComplete="off"
            className="w-full h-12 px-4 rounded-xl bg-white/70 border border-zinc-300/50 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="Örn: Toplantı, Randevu, Ödeme..."
            required
          />
        </div>

        {/* Tarih ve Saat */}
        <div>
          <label htmlFor="due_date" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
            Tarih ve Saat
          </label>
          <div className="relative">
            <input
              id="due_date"
              name="due_date"
              type="datetime-local"
              className="w-full h-12 px-4 rounded-xl bg-white/70 border border-zinc-300/50 text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white transition-all [color-scheme:dark] light:[color-scheme:light]"
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
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
          {isPending ? "Kaydediliyor..." : "Hatırlatma Oluştur"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 h-12 bg-white/5 dark:bg-white/5 light:bg-zinc-100 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 border border-white/10 dark:border-white/10 light:border-zinc-300 dark:border-white/10 dark:border-white/10 light:border-zinc-300 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 rounded-xl text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 font-semibold transition-all"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  );
}
