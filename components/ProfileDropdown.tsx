"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Settings, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient as createClient } from "@/lib/supabase/client";
import { useModalStore } from "@/lib/store/useModalStore";

interface ProfileDropdownProps {
  user: User;
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient(); // Supabase'i başlat

  const openProfileModal = useModalStore((state) => state.openProfileModal);
  const openSettingsModal = useModalStore((state) => state.openSettingsModal);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SOFT LOGOUT - Redirect to login with email pre-filled
  // SOFT LOGOUT - Redirect to login with email pre-filled
  const handleLogout = async () => {
    const email = user.email;

    // Cache user details for instant load on login screen
    if (typeof window !== 'undefined' && email) {
      const userDetails = {
        email,
        name: user.user_metadata?.full_name || email.split("@")[0],
        avatarUrl: user.user_metadata?.avatar_url
      };
      localStorage.setItem(`cached_user_${email}`, JSON.stringify(userDetails));
    }

    await supabase.auth.signOut();
    router.push(`/login?email=${email}`);
    router.refresh();
  };

  const handleOpenProfile = () => {
    openProfileModal();
    setIsOpen(false);
  };

  const handleOpenSettings = () => {
    openSettingsModal();
    setIsOpen(false);
  };

  const initial = user.email?.charAt(0).toUpperCase() || "U";
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 transition-all hover:bg-zinc-100 dark:hover:bg-white/10 outline-none cursor-pointer z-50 shadow-sm dark:shadow-none"
      >
        <div className="h-8 w-8 overflow-hidden rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-gray-700 flex items-center justify-center">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} className="h-full w-full object-cover" alt="Avatar" />
          ) : (
            <span className="text-xs font-bold text-zinc-700 dark:text-white">{initial}</span>
          )}
        </div>
        <span className="text-sm font-medium text-zinc-900 dark:text-white hidden md:block">{userName}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 z-[99999] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-1.5">
            {/* User Info Header - Minimalist */}
            <div className="px-3 py-2.5 mb-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{userName}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-medium opacity-80">{user.email}</p>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-white/5 mx-3 mb-1.5" />

            {/* Menu Items - iOS Style */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleOpenProfile(); }}
                className="group flex w-full items-center gap-3 px-3 py-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                Profilim
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleOpenSettings(); }}
                className="group flex w-full items-center gap-3 px-3 py-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
              >
                <Settings className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                Ayarlar
              </button>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-white/5 mx-3 my-1.5" />

            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 px-3 py-2 text-[13px] font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-500 dark:text-red-400/80 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}