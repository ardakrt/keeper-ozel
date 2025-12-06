"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { stripHtml } from "@/lib/textUtils";
import { useAppStore } from "@/lib/store/useAppStore";

export default function NotesWidget() {
  const { notes } = useAppStore();
  const recentNote = notes && notes.length > 0 ? notes[0] : null;

  return (
    <Link href="/dashboard/notes" className="group lg:col-span-2 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/[0.08] hover:border-emerald-500/40 dark:hover:border-emerald-500/30 rounded-[2rem] p-8 flex flex-col justify-between relative transition-all duration-500 overflow-hidden backdrop-blur-2xl h-[200px] shadow-xl hover:shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500"></div>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-3 max-w-[85%]">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            {recentNote ? recentNote.title : "Hızlı Not"}
            {!recentNote && <span className="text-xs font-normal text-zinc-600 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Boş</span>}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-2">
            {recentNote ? stripHtml(recentNote.content) : "Henüz bir notun yok. Buraya tıklayarak ilk notunu oluştur."}
          </p>
          {recentNote && (
            <span className="text-xs text-zinc-500 dark:text-zinc-600 block pt-2">
              {new Date(recentNote.updated_at || recentNote.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
          <Plus className="w-6 h-6 text-white dark:text-black" strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
}
