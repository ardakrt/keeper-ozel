"use client";

import { useTransition } from "react";
import { createAccount } from "@/app/actions";

interface NewAccountFormProps {
  onAccountCreated?: () => void;
  onCancel?: () => void;
}

export default function NewAccountForm({ onAccountCreated, onCancel }: NewAccountFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={async (formData) => {
        startTransition(async () => {
          await createAccount(formData);
          const { invalidateCache } = await import('@/components/DataPreloader');
          invalidateCache('accounts');
          if (onAccountCreated) {
            onAccountCreated();
          }
        });
      }}
      className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-zinc-50/95 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300/50 rounded-2xl p-8 max-w-2xl mx-auto light:shadow-xl"
    >
      {/* Başlık */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 tracking-tight mb-2">Yeni Hesap Ekle</h3>
        <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600 text-sm">Hesap bilgilerinizi güvenli bir şekilde kaydedin</p>
      </div>

      {/* Input Alanları */}
      <div className="space-y-5">
        {/* Hizmet Adı */}
        <div>
          <label htmlFor="service_name" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
            Hizmet Adı
          </label>
          <input
            id="service_name"
            name="service_name"
            type="text"
            autoComplete="off"
            className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="Örn: Netflix, Spotify, Instagram"
            required
          />
        </div>

        {/* Kullanıcı Adı / E-posta */}
        <div>
          <label htmlFor="username" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
            Kullanıcı Adı / E-posta
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="off"
            className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="ornek@email.com"
            required
          />
        </div>

        {/* Parola */}
        <div>
          <label htmlFor="password" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
            Parola
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="off"
            className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="••••••••"
            required
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
