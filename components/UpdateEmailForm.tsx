"use client";

import { useTransition } from "react";
import { updateUserEmail } from "@/app/actions";
import { toast } from "react-hot-toast";

interface UpdateEmailFormProps {
  user: any;
  onBack: () => void;
}

export default function UpdateEmailForm({ user, onBack }: UpdateEmailFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="animate-fadeIn">
      {/* Header with Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white dark:text-white light:text-zinc-900 transition-colors mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Geri</span>
      </button>

      {/* Form */}
      <div className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-white backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white dark:text-white light:text-zinc-900 mb-2">E-posta Değiştir</h2>
        <p className="text-zinc-500 text-sm mb-6">Mevcut e-posta: {user?.email}</p>

        <form
          action={(formData) => {
            startTransition(async () => {
              await updateUserEmail(formData as FormData);
              toast.success("E-posta değiştirme isteği gönderildi. Yeni e-postanıza gelen onay linkine tıklayın.");
              onBack();
            });
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="new_email" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
              Yeni E-posta Adresi
            </label>
            <input
              id="new_email"
              name="new_email"
              type="email"
              autoComplete="email"
              className="w-full bg-black/50 dark:bg-black/50 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-white dark:text-white light:text-zinc-900 rounded-xl h-12 px-4 placeholder-zinc-500 dark:placeholder-zinc-500 light:placeholder-zinc-400 outline-none transition-all"
              placeholder="yeni@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white dark:bg-white dark:text-black light:bg-zinc-900 light:text-white hover:bg-zinc-200 font-bold h-12 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Gönderiliyor..." : "E-posta Değiştir"}
          </button>
        </form>
      </div>
    </div>
  );
}
