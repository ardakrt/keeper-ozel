import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import NoteItem from "@/components/NoteItem";

type Note = {
  id?: string | number;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
};

interface NotesListProps {
  notes: Note[] | null;
  searchQuery?: string;
  onRefresh?: () => void;
  onEditNote?: (note: Note) => void;
  isSelectionMode?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onTriggerDeleteAll?: () => void;
}

export default function NotesList({
  notes,
  onRefresh,
  onEditNote,
  searchQuery = "",
  isSelectionMode = false,
  selectedIds = [],
  onToggle,
  onTriggerDeleteAll
}: NotesListProps) {
  const [contextMenu, setContextMenu] = useState<{ note: Note; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleResize = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleContextMenu = (note: Note, e: React.MouseEvent) => {
    // Prevent default browser menu is handled in NoteItem, but we ensure it here too just in case
    e.preventDefault();
    setContextMenu({ note, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleShare = async () => {
    if (!contextMenu) return;
    try {
      const shareText = `${contextMenu.note.title ?? "(Başlıksız)"}\n\n${contextMenu.note.content ?? ""}`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Not panoya kopyalandı!");
      closeContextMenu();
    } catch (error) {
      console.error("Kopyalama hatası:", error);
      closeContextMenu();
    }
  };

  const handleEdit = () => {
    if (contextMenu && onEditNote) {
      onEditNote(contextMenu.note);
    }
    closeContextMenu();
  };

  const handleSelectAll = () => {
    if (onTriggerDeleteAll) {
      onTriggerDeleteAll();
    }
    closeContextMenu();
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="bg-white/[0.02] dark:bg-white/[0.02] light:bg-zinc-50 border border-dashed border-white/[0.05] dark:border-white/[0.05] light:border-zinc-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-zinc-600 dark:text-zinc-600 light:text-zinc-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h3 className="text-zinc-100 dark:text-zinc-100 light:text-zinc-900 font-semibold">Henüz bir notunuz bulunmuyor</h3>
        <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-sm mt-1">Yeni Not Ekle butonuna tıklayarak başlayın</p>
      </div>
    );
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredNotes = normalizedQuery
    ? notes.filter((note) => {
      const title = (note.title ?? "").toLowerCase();
      const content = (note.content ?? "").toLowerCase();
      return title.includes(normalizedQuery) || content.includes(normalizedQuery);
    })
    : notes;

  if (normalizedQuery && filteredNotes.length === 0) {
    return (
      <div className="bg-white/[0.02] dark:bg-white/[0.02] light:bg-zinc-50 border border-dashed border-white/[0.05] dark:border-white/[0.05] light:border-zinc-300 rounded-2xl p-12 text-center text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
        Aramanızla eşleşen not bulunamadı.
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
        {filteredNotes.map((note) => (
          <NoteItem
            key={note.id as any}
            note={note}
            onRefresh={onRefresh}
            onEdit={onEditNote}
            isSelectionMode={isSelectionMode}
            isSelected={selectedIds.includes(String(note.id))}
            onToggle={onToggle}
            onTriggerDeleteAll={onTriggerDeleteAll}
            onContextMenu={handleContextMenu}
          />
        ))}
      </ul>

      {contextMenu && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-2xl py-1 w-[200px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Düzenle
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Panoya Kopyala
          </button>

          <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1" />

          <button
            onClick={handleSelectAll}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tümünü Seç
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
