"use client";

import { useState } from "react";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase/client";
import { updateAvatarMetadata } from "@/app/actions";
import { toast } from "react-hot-toast";

export default function AvatarUploadForm({ currentAvatar, userId, onRefresh }: { currentAvatar: string | undefined | null; userId: string; onRefresh?: () => void }) {
  const supabase = createBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Lütfen bir görsel seçin");
      return;
    }
    setIsUploading(true);
    try {
      const original = file.name;
      const dot = original.lastIndexOf(".");
      const ext = dot > -1 ? original.slice(dot + 1).toLowerCase() : "png";
      const base = (dot > -1 ? original.slice(0, dot) : original)
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "");
      const safeName = `${Date.now()}_${base || "avatar"}.${ext}`;
      const path = `${userId}/${safeName}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      await updateAvatarMetadata(publicUrl);
      toast.success("Profil resmi güncellendi!");
      setFile(null); // Reset file selection
      if (onRefresh) {
        onRefresh(); // Trigger data reload
      }
    } catch (err: any) {
      toast.error(err?.message || "Yükleme başarısız oldu");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
      {/* Avatar - Tıklanabilir */}
      <label htmlFor="avatar-upload" className="group relative w-32 h-32 rounded-full overflow-hidden cursor-pointer ring-2 ring-white/10 hover:ring-white/30 transition-all">
        {currentAvatar ? (
          <Image
            src={currentAvatar}
            alt="Avatar"
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}

        {/* Hover Overlay - Kamera İkonu */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-white mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-white text-sm font-medium">Değiştir</span>
        </div>
      </label>

      {/* Gizli File Input */}
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Kaydet Butonu - Sadece dosya seçildiğinde göster */}
      {file && (
        <button
          type="submit"
          disabled={isUploading}
          className="px-6 py-2.5 bg-white hover:bg-gray-200 dark:bg-white dark:hover:bg-gray-200 dark:text-black light:bg-black light:hover:bg-zinc-800 light:text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          {isUploading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      )}
    </form>
  );
}
