"use client";

import { useState, useTransition } from "react";
import { deleteReminder, updateReminder } from "@/app/actions";

type Reminder = {
  id?: string | number;
  title?: string | null;
  content?: string | null;
  due_at?: string | null;
  due_date?: string | null; // Backward compatibility
  category?: string | null;
  channel?: string | null;
};

export default function ReminderItem({ reminder, onRefresh }: { reminder: Reminder; onRefresh?: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // UTC'den local datetime-local formatına çevir
  const toLocalDatetimeString = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const handleDelete = async () => {
    const formData = new FormData();
    formData.append("id", String(reminder.id ?? ""));
    await deleteReminder(formData);
    if (onRefresh) {
      onRefresh();
    }
  };

  // Kategori bazlı renk seçimi
  const getBorderColor = (category: string | null | undefined) => {
    switch (category?.toLowerCase()) {
      case 'work':
      case 'iş':
        return 'border-l-blue-500';
      case 'personal':
      case 'kişisel':
        return 'border-l-green-500';
      case 'urgent':
      case 'acil':
        return 'border-l-red-500';
      default:
        return 'border-l-purple-500';
    }
  };

  return (
    <li className="group relative">
      {isEditing ? (
        <form
          action={(formData) => {
            startTransition(async () => {
              await updateReminder(formData as FormData);
              setIsEditing(false);
              if (onRefresh) {
                onRefresh();
              }
            });
          }}
          className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-zinc-50 p-6 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-300 space-y-4 light:shadow-xl"
        >
          <input type="hidden" name="id" value={String(reminder.id ?? "")} />

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600">Hatırlatma Başlığı</label>
            <input
              name="title"
              type="text"
              defaultValue={reminder.title ?? ""}
              className="bg-black/30 dark:bg-black/30 light:bg-zinc-100 dark:bg-black/30 dark:bg-black/30 light:bg-zinc-100 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-300 dark:border-white/10 dark:border-white/10 light:border-zinc-300 light:border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 outline-none"
              placeholder="Hatırlatma başlığı"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 light:text-zinc-600 light:text-zinc-600">Tarih ve Saat</label>
            <input
              name="due_date"
              type="datetime-local"
              defaultValue={toLocalDatetimeString(reminder.due_at || reminder.due_date || null)}
              className="bg-black/30 dark:bg-black/30 light:bg-zinc-100 dark:bg-black/30 dark:bg-black/30 light:bg-zinc-100 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-300 dark:border-white/10 dark:border-white/10 light:border-zinc-300 light:border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 outline-none [color-scheme:dark] light:[color-scheme:light]"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 bg-blue-600 rounded-lg text-white dark:text-white light:text-zinc-900 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 rounded-lg text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-300 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Action Buttons - Floating Bubble */}
          <div className="absolute -top-3 right-4 z-50 flex items-center gap-1 bg-white dark:bg-white dark:text-black light:bg-zinc-900 light:text-white rounded-full shadow-xl p-1.5 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors active:scale-90"
              title="Düzenle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors active:scale-90"
              title="Sil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className={`bg-white/[0.02] dark:bg-white/[0.02] light:bg-white border border-white/[0.05] dark:border-white/[0.05] light:border-zinc-200 hover:border-white/[0.1] dark:hover:border-white/[0.1] light:hover:border-zinc-300 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] light:hover:bg-zinc-50 rounded-2xl p-5 relative transition-all border-l-4 ${getBorderColor(reminder.category)} overflow-hidden light:shadow-sm`}>
      {/* Crystal Maze Pattern - Light Mode Only */}
      <svg className="absolute inset-0 w-full h-full light:block hidden" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="crystal-maze-reminder" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="var(--accent-color)" fillOpacity="0.03"/>
            <path d="M25 25 L50 0 L75 25 L50 50 Z" fill="var(--accent-color)" fillOpacity="0.05"/>
            <path d="M25 75 L50 50 L75 75 L50 100 Z" fill="var(--accent-color)" fillOpacity="0.05"/>
            <path d="M0 50 L25 25 L50 50 L25 75 Z" fill="var(--accent-color)" fillOpacity="0.05"/>
            <path d="M50 50 L75 25 L100 50 L75 75 Z" fill="var(--accent-color)" fillOpacity="0.05"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#crystal-maze-reminder)"/>
      </svg>

      {/* Header with Icon */}
      <div className="flex items-start gap-3 mb-3 relative z-10">
        <div className="p-2 bg-purple-600/10 dark:bg-purple-600/10 light:bg-purple-100 rounded-lg flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-400 dark:text-purple-400 light:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white dark:text-white light:text-zinc-900 text-lg truncate">
            {reminder.title ?? "(Başlıksız Hatırlatma)"}
          </h3>
        </div>
      </div>

      {/* Content/Description */}
      {reminder.content && (
        <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-sm line-clamp-2 mb-4 pl-11 relative z-10">
          {reminder.content}
        </p>
      )}

      {/* Date Badge */}
      {(reminder.due_at || reminder.due_date) && (
        <div className="flex items-center justify-between mt-4 pl-11 relative z-10">
          <span className="bg-white/5 dark:bg-white/5 light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-2 light:border light:border-zinc-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDateTime(reminder.due_at || reminder.due_date || null)}
          </span>
        </div>
      )}

      {/* Hover Effect Indicator */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all pointer-events-none" />
          </div>
        </>
      )}
    </li>
  );
}
