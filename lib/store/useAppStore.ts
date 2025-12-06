import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { Card } from '@/types/card';

export interface AppState {
  user: User | null;
  wallets: any[];
  notes: any[];
  files: any[];
  cards: Card[]; // Using Card type from types/card.ts
  ibans: any[];
  accounts: any[];
  todos: any[];
  reminders: any[];
  isLoaded: boolean;
  
  setAllData: (data: {
    user: User | null;
    wallets: any[];
    notes: any[];
    files: any[];
    cards: any[]; // Incoming data might be raw, but we cast to Card[] in state if needed
    ibans: any[];
    accounts: any[];
    todos: any[];
    reminders?: any[];
  }) => void;
  
  // Individual setters for optimistic updates
  setNotes: (notes: any[]) => void;
  addNote: (note: any) => void;
  updateNote: (id: string, updates: any) => void;
  deleteNote: (id: string) => void;
  
  setReminders: (reminders: any[]) => void;
  setCards: (cards: Card[]) => void;
  setIbans: (ibans: any[]) => void;
  setAccounts: (accounts: any[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  wallets: [],
  notes: [],
  files: [],
  cards: [],
  ibans: [],
  accounts: [],
  todos: [],
  reminders: [],
  isLoaded: false,

  setAllData: (data) => set({
    user: data.user,
    wallets: data.wallets,
    notes: data.notes,
    files: data.files,
    cards: data.cards,
    ibans: data.ibans,
    accounts: data.accounts,
    todos: data.todos,
    reminders: data.reminders || [],
    isLoaded: true
  }),
  
  // Individual setters for notes
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map((n) => n.id === id ? { ...n, ...updates } : n)
  })),
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((n) => n.id !== id)
  })),
  
  setReminders: (reminders) => set({ reminders }),
  setCards: (cards) => set({ cards }),
  setIbans: (ibans) => set({ ibans }),
  setAccounts: (accounts) => set({ accounts }),
}));
