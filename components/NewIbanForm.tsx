"use client";

import { useState, useTransition } from "react";
import { createIban } from "@/app/actions";
import ServiceLogo from "@/components/finance/ServiceLogo";
import { getBankInfo } from "@/lib/serviceIcons";

interface NewIbanFormProps {
  onIbanCreated?: () => void;
  onCancel?: () => void;
}

export default function NewIbanForm({ onIbanCreated, onCancel }: NewIbanFormProps) {
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState("");

  return (
    <form
      action={async (formData) => {
        startTransition(async () => {
          await createIban(formData);
          const { invalidateCache } = await import('@/components/DataPreloader');
          invalidateCache('ibans');
          if (onIbanCreated) {
            onIbanCreated();
          }
        });
      }}
      className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-zinc-50/95 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300/50 rounded-2xl p-8 max-w-2xl mx-auto light:shadow-xl"
    >
      {/* Başlık */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 tracking-tight mb-2">Yeni IBAN Ekle</h3>
        <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600 text-sm">Banka hesap bilgilerinizi güvenli bir şekilde kaydedin</p>
      </div>

      {/* Input Alanları */}
      <div className="space-y-5">
        {/* Etiket */}
        <div>
          <label htmlFor="label" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
            Etiket / Banka Adı
          </label>
          <div className="relative">
            <input
              id="label"
              name="label"
              type="text"
              autoComplete="off"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white pl-16"
              placeholder="Örn: İş Bankası Maaş Hesabı"
              required
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
               <ServiceLogo 
                 brand={getBankInfo(label)} 
                 fallbackText={label} 
                 size="md"
                 className="bg-transparent border-none shadow-none scale-75"
               />
            </div>
          </div>
        </div>

        {/* Ad Soyad */}
        <div>
          <label htmlFor="holder_name" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
            Hesap Sahibi (Ad Soyad)
          </label>
          <input
            id="holder_name"
            name="holder_name"
            type="text"
            autoComplete="off"
            className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="Örn: Ahmet Yılmaz"
            required
          />
        </div>

        {/* IBAN Numarası */}
        <div>
          <label htmlFor="number" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
            IBAN Numarası
          </label>
          <input
            id="number"
            name="number"
            type="text"
            autoComplete="off"
            className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono tracking-wider uppercase dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            required
            maxLength={32}
          />
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
