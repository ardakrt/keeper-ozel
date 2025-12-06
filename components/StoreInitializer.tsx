"use client";

import { useRef } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { PreloadData } from "@/app/actions/preload";

export default function StoreInitializer({ data }: { data: PreloadData }) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useAppStore.setState({
      user: data.user,
      wallets: data.wallets,
      notes: data.notes,
      files: data.files,
      cards: data.cards,
      ibans: data.ibans,
      accounts: data.accounts,
      todos: data.todos,
      reminders: data.reminders,
      isLoaded: true,
    });
    initialized.current = true;
  }

  return null;
}
