"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, History } from "lucide-react";
import ReminderList from "@/components/ReminderList";
import NewReminderForm from "@/components/NewReminderForm";
import { useModalStore } from "@/lib/store/useModalStore";

type Reminder = {
  id?: string | number;
  title?: string | null;
  content?: string | null;
  due_at?: string | null;
  due_date?: string | null; // Backward compatibility
  category?: string | null;
  channel?: string | null;
};

interface RemindersPageManagerProps {
  reminders: Reminder[];
  onRefresh?: () => void;
}

export default function RemindersPageManager({ reminders, onRefresh }: RemindersPageManagerProps) {
  const [view, setView] = useState<"list" | "create">("list");
  const [tab, setTab] = useState<"active" | "past">("active");
  const isAddReminderModalOpen = useModalStore((state) => state.isAddReminderModalOpen);
  const openAddReminderModal = useModalStore((state) => state.openAddReminderModal);
  const closeAddReminderModal = useModalStore((state) => state.closeAddReminderModal);

  // Hatırlatmaları aktif ve geçmiş olarak ayır
  const { activeReminders, pastReminders } = useMemo(() => {
    const now = new Date();
    const active: Reminder[] = [];
    const past: Reminder[] = [];

    reminders.forEach((reminder) => {
      const dueDate = reminder.due_at || reminder.due_date;
      if (dueDate && new Date(dueDate) < now) {
        past.push(reminder);
      } else {
        active.push(reminder);
      }
    });

    return { activeReminders: active, pastReminders: past };
  }, [reminders]);

  useEffect(() => {
    if (isAddReminderModalOpen) {
      setView("list");
    }
  }, [isAddReminderModalOpen]);

  const handleReminderCreated = () => {
    closeAddReminderModal();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCancel = () => {
    closeAddReminderModal();
  };

  return (
    <div className="animate-fadeIn w-full">
      {/* Centralized Dashboard Panel */}
      <motion.div
        layout
        transition={{ duration: 0.3 }}
        className="w-full min-h-[750px] flex flex-col rounded-3xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-black/20 dark:bg-black/20 light:bg-white/90 backdrop-blur-sm overflow-hidden light:shadow-xl"
      >
        {/* Header Section - Inside Container */}
        <div className="p-8 border-b border-white/5 dark:border-white/5 light:border-zinc-200">
          <div className="flex items-center justify-between mb-6">
            {/* Left Side - Title and Subtitle */}
            <div>
              <h1 className="text-2xl font-bold text-white dark:text-white light:text-zinc-900">Hatırlatmalarım</h1>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-zinc-500 mt-1">Planlanmış etkinlikleriniz</p>
            </div>

            {/* Right Side - Add Button */}
            {view === "list" && !isAddReminderModalOpen ? (
              <button
                onClick={openAddReminderModal}
                className="bg-white dark:bg-white light:bg-zinc-900 text-black dark:text-black light:text-white hover:bg-zinc-200 dark:hover:bg-zinc-200 light:hover:bg-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Yeni Hatırlatma Ekle
              </button>
            ) : (
              <button
                onClick={closeAddReminderModal}
                className="bg-white/5 dark:bg-white/5 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 border border-white/10 dark:border-white/10 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Listeye Dön
              </button>
            )}
          </div>

          {/* Tab Switcher - Only show when viewing list */}
          {view === "list" && !isAddReminderModalOpen && (
            <div className="flex justify-center">
              <div className="light:bg-zinc-100 dark:bg-white/5 backdrop-blur-md light:border-zinc-200 dark:border-white/10 border p-1 rounded-2xl flex gap-1">
                <button
                  onClick={() => setTab('active')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${tab === 'active'
                    ? 'light:bg-white dark:bg-zinc-800 light:text-zinc-900 dark:text-white shadow-lg'
                    : 'light:text-zinc-600 dark:text-zinc-400 light:hover:text-zinc-900 dark:hover:text-white light:hover:bg-zinc-50 dark:hover:bg-white/5'
                    }`}
                >
                  <Bell size={14} />
                  <span className="hidden sm:inline">Aktif Hatırlatmalar</span>
                  <span className="sm:hidden">Aktif</span>
                  {activeReminders.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-500">
                      {activeReminders.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setTab('past')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${tab === 'past'
                    ? 'light:bg-white dark:bg-zinc-800 light:text-zinc-900 dark:text-white shadow-lg'
                    : 'light:text-zinc-600 dark:text-zinc-400 light:hover:text-zinc-900 dark:hover:text-white light:hover:bg-zinc-50 dark:hover:bg-white/5'
                    }`}
                >
                  <History size={14} />
                  <span className="hidden sm:inline">Geçmiş Hatırlatmalar</span>
                  <span className="sm:hidden">Geçmiş</span>
                  {pastReminders.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-zinc-500/20 text-zinc-500">
                      {pastReminders.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area - Inside Container */}
        <div className="p-8 w-full h-full">
          <AnimatePresence mode="wait">
            {view === "list" && !isAddReminderModalOpen ? (
              <motion.div
                key={`list-${tab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {(tab === 'active' || pastReminders.length > 0) && (
                  <ReminderList reminders={tab === 'active' ? activeReminders : pastReminders} />
                )}
                {tab === 'past' && pastReminders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <History className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Geçmiş hatırlatma yok</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                      Tarihi geçmiş hatırlatmalarınız burada görünecek
                    </p>
                  </div>
                )}
              </motion.div>
            ) : null}

            {view === "list" && isAddReminderModalOpen ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <NewReminderForm
                  onReminderCreated={handleReminderCreated}
                  onCancel={handleCancel}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div >
  );
}
