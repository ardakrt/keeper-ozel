"use client";

import { useTransition } from "react";
import { updateUserName } from "@/app/actions";

interface UpdateNameFormProps {
  user: any;
  onBack: () => void;
}

export default function UpdateNameForm({ user, onBack }: UpdateNameFormProps) {
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
        <h2 className="text-2xl font-bold text-white dark:text-white light:text-zinc-900 mb-6">İsim Değiştir</h2>

        <form
          action={(formData) => {
            startTransition(async () => {
              await updateUserName(formData as FormData);
              onBack();
            });
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="name" className="block text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs uppercase tracking-wider font-semibold ml-1 mb-2">
              Ad Soyad
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={user?.user_metadata?.full_name ?? ""}
              className="w-full bg-black/50 dark:bg-black/50 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white dark:text-white light:text-zinc-900 rounded-xl h-12 px-4 placeholder-zinc-500 dark:placeholder-zinc-500 light:placeholder-zinc-400 outline-none transition-all"
              placeholder="Ad Soyad"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white dark:bg-white dark:text-black light:bg-zinc-900 light:text-white hover:bg-zinc-200 font-bold h-12 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      </div>
    </div>
  );
}
