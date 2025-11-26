"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import AvatarUploadForm from "@/components/AvatarUploadForm";

interface ProfileMenuProps {
  user: any;
  onViewChange: (view: "menu" | "name" | "email" | "password") => void;
  onRefresh?: () => void;
}

export default function ProfileMenu({ user, onViewChange, onRefresh }: ProfileMenuProps) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="bg-transparent">
      {/* Avatar ve Kullanıcı Bilgileri */}
      <div className="flex flex-col items-center mb-8">
        <AvatarUploadForm currentAvatar={user?.user_metadata?.avatar_url} userId={user?.id} onRefresh={onRefresh} />
        <h2 className="text-2xl font-bold text-white dark:text-white light:text-zinc-900 text-center mt-4">
          {user?.user_metadata?.full_name || "Kullanıcı"}
        </h2>
        <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-sm text-center mt-1">
          {user?.email}
        </p>
      </div>

      {/* Menü Listesi */}
      <div className="space-y-3">
        {/* İsim Değiştir */}
        <button
          onClick={() => onViewChange("name")}
          className="w-full dark:bg-zinc-900/50 light:bg-white border border-white/5 light:border-zinc-200 rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer group light:shadow-sm light:hover:bg-zinc-50 dark:hover:border-white/20 light:hover:border-zinc-300"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 light:bg-zinc-100 dark:bg-purple-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 light:text-zinc-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-white dark:text-white light:text-zinc-900 font-medium">İsim Değiştir</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-500 dark:text-white light:text-zinc-500 light:group-hover:text-zinc-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* E-posta Değiştir */}
        <button
          onClick={() => onViewChange("email")}
          className="w-full dark:bg-zinc-900/50 light:bg-white border border-white/5 light:border-zinc-200 rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer group light:shadow-sm light:hover:bg-zinc-50 dark:hover:border-white/20 light:hover:border-zinc-300"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 light:bg-zinc-100 dark:bg-green-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 light:text-zinc-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white dark:text-white light:text-zinc-900 font-medium">E-posta Değiştir</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-500 dark:text-white light:text-zinc-500 light:group-hover:text-zinc-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Şifre Değiştir */}
        <button
          onClick={() => onViewChange("password")}
          className="w-full dark:bg-zinc-900/50 light:bg-white border border-white/5 light:border-zinc-200 rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer group light:shadow-sm light:hover:bg-zinc-50 dark:hover:border-white/20 light:hover:border-zinc-300"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 light:bg-zinc-100 dark:bg-orange-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 light:text-zinc-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-white dark:text-white light:text-zinc-900 font-medium">Şifre Değiştir</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-500 dark:text-white light:text-zinc-500 light:group-hover:text-zinc-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Çıkış Yap Butonu */}
      <button
        onClick={handleLogout}
        className="w-full mt-6 p-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-medium light:bg-white light:border light:border-zinc-200 light:text-zinc-600 light:hover:bg-red-50 light:hover:text-red-600 light:hover:border-red-200 dark:bg-zinc-900/50 dark:border dark:border-white/10 dark:text-white dark:hover:bg-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Çıkış Yap
      </button>
    </div>
  );
}
