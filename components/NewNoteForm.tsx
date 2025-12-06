"use client";

import { useTransition } from "react";
import { createNote } from "@/app/actions";

interface NewNoteFormProps {
  onNoteCreated?: () => void;
  onCancel?: () => void;
}

export default function NewNoteForm({ onNoteCreated, onCancel }: NewNoteFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={async (formData) => {
        startTransition(async () => {
          await createNote(formData);
          const { invalidateCache } = await import('@/components/DataPreloader');
          invalidateCache('notes');
          if (onNoteCreated) {
            onNoteCreated();
          }
        });
      }}
      className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-zinc-50/95 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300/50 rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-2xl light:shadow-xl"
    >
      {/* Editor Area - Paper-like */}
      <div className="p-8">
        {/* Title Input - Clean, borderless */}
        <input
          id="title"
          name="title"
          type="text"
          autoComplete="off"
          className="w-full text-2xl font-bold bg-white/70 border border-zinc-300/50 text-black placeholder:text-zinc-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black dark:bg-white/5 dark:border-white/10 dark:text-white p-3 mb-6"
          placeholder="Not Başlığı..."
          required
        />

        {/* Content Textarea - Spacious writing area */}
        <textarea
          id="content"
          name="content"
          autoComplete="off"
          className="w-full h-64 bg-white/70 border border-zinc-300/50 text-black placeholder:text-zinc-400 dark:bg-white/5 dark:border-white/10 dark:text-white resize-none outline-none p-3 text-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          placeholder="Notunuzu buraya yazın..."
          required
        />
      </div>

      {/* Action Bar */}
      <div className="border-t border-white/10 dark:border-white/10 light:border-zinc-300 dark:border-white/10 dark:border-white/10 light:border-zinc-300 light:border-zinc-300 bg-black/20 dark:bg-black/20 light:bg-zinc-50 px-8 py-4 flex items-center justify-between">
        {/* Left side - metadata placeholder */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500 light:text-zinc-600">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {new Date().toLocaleDateString('tr-TR')}
          </span>
        </div>

        {/* Right side - action buttons */}
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium"
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </form>
  );
}
