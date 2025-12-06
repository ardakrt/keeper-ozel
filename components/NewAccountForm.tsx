"use client";

import { useState, useTransition } from "react";
import { createAccount } from "@/app/actions";
import ServiceLogo from "@/components/finance/ServiceLogo";
import { getBrandInfo } from "@/lib/serviceIcons";

interface NewAccountFormProps {
  onAccountCreated?: () => void;
  onCancel?: () => void;
}

export default function NewAccountForm({ onAccountCreated, onCancel }: NewAccountFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [serviceName, setServiceName] = useState("");

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
          <div className="relative">
            <input
              id="service_name"
              name="service_name"
              type="text"
              autoComplete="off"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white pl-16"
              placeholder="Örn: Netflix, Spotify, Instagram"
              required
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
               <ServiceLogo 
                 brand={getBrandInfo(serviceName)} 
                 fallbackText={serviceName} 
                 size="md"
                 className="bg-transparent border-none shadow-none scale-75"
               />
            </div>
          </div>
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="w-full h-12 px-4 pr-12 rounded-xl bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
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
