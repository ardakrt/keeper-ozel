"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import ProfileModal from "@/components/modals/ProfileModal";
import SettingsModal from "@/components/modals/SettingsModal";
import CommandPalette from "@/components/CommandPalette";
import { useModalStore } from "@/lib/store/useModalStore";

export default function ModalManager() {
  const [user, setUser] = useState<User | null>(null);

  const isProfileModalOpen = useModalStore((state) => state.isProfileModalOpen);
  const closeProfileModal = useModalStore((state) => state.closeProfileModal);
  const isSettingsModalOpen = useModalStore((state) => state.isSettingsModalOpen);
  const closeSettingsModal = useModalStore((state) => state.closeSettingsModal);

  // Supabase istemcisini oluştur
  const supabase = createBrowserClient();

  // Kullanıcıyı çek
  const getUser = async () => {
    // Force refresh from server, not cache
    const { data } = await supabase.auth.refreshSession();
    if (data.session) {
      setUser(data.session.user);
    } else {
      // Fallback to getUser if refresh fails
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!user) return null;

  return (
    <>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        user={user}
        onUpdate={getUser}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        user={user}
      />
      <CommandPalette />
    </>
  );
}