import { create } from 'zustand';

type ModalState = {
  isProfileModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  isAddNoteModalOpen: boolean;
  isAddReminderModalOpen: boolean;
  isAddCardModalOpen: boolean;
  isAddIbanModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openAddNoteModal: () => void;
  closeAddNoteModal: () => void;
  openAddReminderModal: () => void;
  closeAddReminderModal: () => void;
  openAddCardModal: () => void;
  closeAddCardModal: () => void;
  openAddIbanModal: () => void;
  closeAddIbanModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  isProfileModalOpen: false,
  isSettingsModalOpen: false,
  isCommandPaletteOpen: false,
  isAddNoteModalOpen: false,
  isAddReminderModalOpen: false,
  isAddCardModalOpen: false,
  isAddIbanModalOpen: false,
  openProfileModal: () => set({ isProfileModalOpen: true }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  openAddNoteModal: () => set({ isAddNoteModalOpen: true }),
  closeAddNoteModal: () => set({ isAddNoteModalOpen: false }),
  openAddReminderModal: () => set({ isAddReminderModalOpen: true }),
  closeAddReminderModal: () => set({ isAddReminderModalOpen: false }),
  openAddCardModal: () => set({ isAddCardModalOpen: true }),
  closeAddCardModal: () => set({ isAddCardModalOpen: false }),
  openAddIbanModal: () => set({ isAddIbanModalOpen: true }),
  closeAddIbanModal: () => set({ isAddIbanModalOpen: false }),
}));
