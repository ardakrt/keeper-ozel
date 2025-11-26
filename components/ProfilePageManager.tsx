"use client";

import { useState } from "react";
import ProfileMenu from "@/components/ProfileMenu";
import UpdateNameForm from "@/components/UpdateNameForm";
import UpdateEmailForm from "@/components/UpdateEmailForm";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";

interface ProfilePageManagerProps {
  user: any;
  onRefresh?: () => void;
}

export default function ProfilePageManager({ user, onRefresh }: ProfilePageManagerProps) {
  const [view, setView] = useState<"menu" | "name" | "email" | "password">("menu");

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 bg-transparent">
      {/* Başlık */}
      <h1 className="text-3xl font-bold dark:text-white light:text-zinc-900 mb-8">Profil Ayarları</h1>

      {view === "menu" && (
        <ProfileMenu user={user} onViewChange={setView} onRefresh={onRefresh} />
      )}
      {view === "name" && (
        <UpdateNameForm user={user} onBack={() => setView("menu")} />
      )}
      {view === "email" && (
        <UpdateEmailForm user={user} onBack={() => setView("menu")} />
      )}
      {view === "password" && (
        <UpdatePasswordForm onBack={() => setView("menu")} />
      )}
    </div>
  );
}
