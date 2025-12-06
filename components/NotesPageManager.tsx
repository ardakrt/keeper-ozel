"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotesList from "@/components/NotesList";
import NewNoteForm from "@/components/NewNoteForm";
import NoteEditor from "@/components/NoteEditor";
import { deleteSelectedNotes } from "@/app/actions";
import { useModalStore } from "@/lib/store/useModalStore";

type Note = {
  id?: string | number;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
};

interface NotesPageManagerProps {
  notes: Note[];
  onRefresh?: () => void;
}

export default function NotesPageManager({ notes, onRefresh }: NotesPageManagerProps) {
  const [view, setView] = useState<"list" | "edit">("list");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const isAddNoteModalOpen = useModalStore((state) => state.isAddNoteModalOpen);
  const openAddNoteModal = useModalStore((state) => state.openAddNoteModal);
  const closeAddNoteModal = useModalStore((state) => state.closeAddNoteModal);

  useEffect(() => {
    if (isAddNoteModalOpen) {
      setView("list");
      setSelectedNote(null);
      setIsSelectionMode(false);
      setSelectedIds([]);
    }
  }, [isAddNoteModalOpen]);

  const handleNoteCreated = () => {
    closeAddNoteModal();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCancel = () => {
    closeAddNoteModal();
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setView("edit");
  };

  const handleCloseEditor = () => {
    setSelectedNote(null);
    setView("list");
  };

  const handleTriggerDeleteAll = () => {
    // Seçim modunu aktif et ve tüm notları seçili olarak başlat
    setIsSelectionMode(true);
    const allIds = notes.map((note) => String(note.id));
    setSelectedIds(allIds);
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((noteId) => noteId !== id) : [...prev, id]
    );
  };

  const executeDelete = () => {
    startTransition(async () => {
      await deleteSelectedNotes(selectedIds);
      setIsSelectionMode(false);
      setSelectedIds([]);
      if (onRefresh) {
        onRefresh();
      }
    });
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="animate-fadeIn w-full h-full px-2 py-4">
      {/* Centralized Dashboard Panel */}
      <motion.div
        layout
        transition={{ duration: 0.3, }}
        className="w-full h-full border border-white/10 dark:border-white/10 light:border-zinc-200 rounded-3xl bg-black/20 dark:bg-black/20 light:bg-white/90 backdrop-blur-sm p-8 overflow-hidden light:shadow-xl flex flex-col"
      >
        {/* Header Section - Top Row */}
        <div className="relative flex items-center justify-center gap-4 mb-10">
          {/* Title - Absolute Left */}
          <h1 className="absolute left-0 text-2xl font-bold text-white dark:text-white light:text-zinc-900">Notlarım</h1>

          {/* Search Bar - Fixed Icon Visibility */}
          <div className="flex justify-center w-full max-w-md">
            <div className="relative w-full group">

              {/* İKON (Düzeltildi: z-10 eklendi ve rengi koyulaştırıldı) */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-focus-within:text-emerald-500 transition-colors duration-300"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>

              {/* INPUT */}
              <input
                type="search"
                placeholder="Notlarda ara..."
                className="
        w-full h-12 
        /* Light Mode Renkleri */
        bg-zinc-100 hover:bg-zinc-200/50
        /* Dark Mode Renkleri */
        dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60
        
        backdrop-blur-xl 
        border border-transparent dark:border-white/10 
        
        /* Focus Efektleri */
        focus:bg-white dark:focus:bg-zinc-900/80
        focus:border-emerald-500/30
        focus:ring-4 focus:ring-emerald-500/10 
        
        rounded-2xl 
        pl-11 pr-4 
        
        text-sm text-zinc-800 dark:text-zinc-200 
        placeholder:text-zinc-400 dark:placeholder:text-zinc-500
        
        transition-all duration-300 ease-out
        outline-none 
        shadow-sm hover:shadow-md
      "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Action Button - Absolute Right */}
          {view === "list" && !isAddNoteModalOpen ? (
            <button
              onClick={openAddNoteModal}
              className="absolute right-0 bg-white dark:bg-white light:bg-zinc-900 text-black dark:text-black light:text-white hover:bg-zinc-200 dark:hover:bg-zinc-200 light:hover:bg-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Not Ekle
            </button>
          ) : (
            <button
              onClick={() => {
                if (view === "edit") {
                  setView("list");
                }
                closeAddNoteModal();
              }}
              className="absolute right-0 bg-white/5 dark:bg-white/5 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 border border-white/10 dark:border-white/10 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Listeye Dön
            </button>
          )}
        </div>

        {/* Content Area - Notes Grid */}
        <div>
          <AnimatePresence mode="wait">
            {view === "list" && !isAddNoteModalOpen ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <NotesList
                  notes={notes}
                  searchQuery={searchQuery}
                  onRefresh={onRefresh}
                  onEditNote={handleEditNote}
                  isSelectionMode={isSelectionMode}
                  selectedIds={selectedIds}
                  onToggle={handleToggle}
                  onTriggerDeleteAll={handleTriggerDeleteAll}
                />
              </motion.div>
            ) : null}
            {view === "list" && isAddNoteModalOpen ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <NewNoteForm
                  onNoteCreated={handleNoteCreated}
                  onCancel={handleCancel}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating Action Bar - Seçim Modu */}
      {
        isSelectionMode && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl px-8 py-4 flex items-center gap-6">
              {/* Seçim Sayısı */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {selectedIds.length} not seçildi
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Silmek istemediğiniz notların işaretini kaldırın
                  </p>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={cancelSelection}
                  className="px-6 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 font-medium transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={isPending || selectedIds.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {isPending ? "Siliniyor..." : "Seçilenleri Sil"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Note Editor Modal */}
      <AnimatePresence>
        {view === "edit" && selectedNote && (
          <NoteEditor
            key="editor"
            note={selectedNote}
            onClose={handleCloseEditor}
            onRefresh={onRefresh}
          />
        )}
      </AnimatePresence>
    </div >
  );
}
