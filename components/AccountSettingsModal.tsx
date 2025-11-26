
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Camera, Save, Lock, ArrowLeft } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/lib/store/useUserStore";


interface AccountSettingsModalProps {
  onClose: () => void;
}

export default function AccountSettingsModal({ onClose }: AccountSettingsModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPin, setNewPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"profile" | "changePin">("profile");
  const pinInputRefs = Array.from({ length: 6 }, () => ({ new: null as HTMLInputElement | null, confirm: null as HTMLInputElement | null }));

  const supabase = useMemo(() => createBrowserClient(), []);

  const loadUserData = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      setUser(null);
      return;
    }

    setUser(currentUser);
    setFullName(currentUser.user_metadata?.full_name || "");
    setEmail(currentUser.email || "");

    let resolvedUrl: string | undefined = currentUser.user_metadata?.avatar_url as string | undefined;

    if (!resolvedUrl && currentUser.id) {
      const { data: avatarData } = supabase.storage.from("avatars").getPublicUrl(`${currentUser.id}/avatar.png`);
      resolvedUrl = avatarData?.publicUrl;
    }

    if (resolvedUrl) {
      const separator = resolvedUrl.includes("?") ? "&" : "?";
      setAvatarUrl(`${resolvedUrl}${separator}t=${Date.now()}`);
    } else {
      setAvatarUrl("");
    }
  }, [supabase]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("User not found");
      }

      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `${currentUser.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) {
        throw new Error("Could not get public URL");
      }

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });

      if (updateUserError) {
        throw updateUserError;
      }

      await loadUserData();
      toast.success("Avatar güncellendi!");
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("Avatar yüklenemedi: " + (error as Error).message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
      useUserStore.getState().fetchUser();
    }
  };

  const handlePinChange = (index: number, value: string, type: 'new' | 'confirm') => {
    if (!/^\d*$/.test(value)) return; // Only numbers
    
    const pins = type === 'new' ? [...newPin] : [...confirmPin];
    pins[index] = value.slice(-1); // Only last digit
    
    if (type === 'new') {
      setNewPin(pins);
    } else {
      setConfirmPin(pins);
    }
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = pinInputRefs[index + 1][type];
      if (nextInput) nextInput.focus();
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, type: 'new' | 'confirm') => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      const prevInput = pinInputRefs[index - 1][type];
      if (prevInput) {
        prevInput.focus();
        const pins = type === 'new' ? [...newPin] : [...confirmPin];
        pins[index - 1] = '';
        if (type === 'new') {
          setNewPin(pins);
        } else {
          setConfirmPin(pins);
        }
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Update name
      if (fullName !== user.user_metadata?.full_name) {
        await supabase.auth.updateUser({
          data: { full_name: fullName }
        });
      }
      if (email !== user.email) {
        await supabase.auth.updateUser({ email });
      }

      await loadUserData();
      toast.success('Profil başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Bir hata oluştu!');
    }
    
    setIsSaving(false);
  };

  const handleSavePin = async () => {
    if (!user) return;

    const newPinString = newPin.join('');
    const confirmPinString = confirmPin.join('');

    if (newPinString.length !== 6) {
      toast.error('Lütfen 6 haneli PIN giriniz!');
      return;
    }

    if (newPinString !== confirmPinString) {
      toast.error('PIN kodları eşleşmiyor!');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          pin: newPinString
        }, {
          onConflict: 'user_id'
        });

      if (!error) {
        setNewPin(["", "", "", "", "", ""]);
        setConfirmPin(["", "", "", "", "", ""]);
        toast.success('PIN başarıyla güncellendi!');
        setViewMode("profile");
      } else {
        console.error('PIN update error:', error);
        toast.error('PIN güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error updating PIN:', error);
      toast.error('Bir hata oluştu!');
    }

    setIsSaving(false);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    // Modal start (invisible)
    hidden: {
      opacity: 0,
      scale: 0.98  // Start very close to 100% size (no big jump)
    },
    // Modal visible
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 } // Fast, simple, clean
    },
    // Modal exit
    exit: {
      opacity: 0,
      scale: 0.98, // Shrink back slightly
      transition: { duration: 0.15 } // Exit even faster
    }
  };

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex justify-between items-center px-8 pt-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              {viewMode === "changePin" && (
                <button
                  onClick={() => {
                    setViewMode("profile");
                    setNewPin(["", "", "", "", "", ""]);
                    setConfirmPin(["", "", "", "", "", ""]);
                  }}
                  className="p-2 rounded-xl dark:text-zinc-400 dark:hover:text-white light:text-zinc-600 light:hover:text-zinc-900 hover:bg-white/5 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-semibold dark:text-white light:text-zinc-900">
                  {viewMode === "profile" ? "Profil Ayarları" : "PIN Değiştir"}
                </h2>
                <p className="text-xs dark:text-zinc-400 light:text-zinc-600 mt-0.5">
                  {viewMode === "profile" ? "Kişisel bilgilerinizi yönetin" : "6 haneli güvenlik PIN'inizi güncelleyin"}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl dark:text-zinc-400 dark:hover:text-white light:text-zinc-600 light:hover:text-zinc-900 hover:bg-white/5 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content - Conditional Rendering */}
          {viewMode === "profile" ? (
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Avatar */}
              <div className="flex flex-col items-center justify-start border-r border-white/5 pr-8">
                <label
                  htmlFor="avatar-upload"
                  className="group flex flex-col items-center justify-center cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-colors w-full"
                >
                  <div className="relative rounded-full overflow-hidden">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-xl">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>

                    {isUploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white text-sm font-medium gap-2">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Yükleniyor...
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-zinc-400 text-center">
                    Avatarı Değiştir
                  </p>

                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

          {/* Right Column - Forms */}
          <div className="col-span-2 space-y-6">
            {/* Name */}
            <div>
              <label className="text-xs dark:text-zinc-400 light:text-zinc-600 uppercase tracking-wider mb-2 block font-medium">
                Tam Ad
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-lg p-3 w-full text-white transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none placeholder:text-zinc-500"
                placeholder="Adınız Soyadınız"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs dark:text-zinc-400 light:text-zinc-600 uppercase tracking-wider mb-2 block font-medium">
                E-posta Adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-lg p-3 w-full text-white transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none placeholder:text-zinc-500"
                placeholder="ornek@email.com"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-sm font-medium dark:text-white light:text-zinc-900 mb-4">Güvenlik</h3>
              
              <button
                onClick={() => setViewMode("changePin")}
                className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-lg p-3 w-full flex items-center justify-center gap-2 text-white"
              >
                <Lock className="w-4 h-4" />
                PIN Kodunu Değiştir
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-white text-black hover:bg-zinc-200 rounded-lg p-3 w-full font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
            </div>
          ) : (
            /* PIN Change Screen */
            <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-8">
              {/* New PIN */}
              <div>
                <label className="text-xs dark:text-zinc-400 light:text-zinc-600 uppercase tracking-wider mb-4 block font-medium text-center">
                  Yeni PIN
                </label>
                <div className="flex gap-3 justify-center">
                  {newPin.map((digit, index) => (
                    <input
                      key={`new-${index}`}
                      ref={(el) => { if (el) pinInputRefs[index].new = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, 'new')}
                      onKeyDown={(e) => handlePinKeyDown(e, index, 'new')}
                      className="w-16 h-20 text-center text-2xl font-bold bg-white/5 border-2 border-white/10 dark:text-white light:text-zinc-900 rounded-2xl focus:bg-white/10 focus:border-white/30 transition-all outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="text-xs dark:text-zinc-400 light:text-zinc-600 uppercase tracking-wider mb-4 block font-medium text-center">
                  PIN Tekrar
                </label>
                <div className="flex gap-3 justify-center">
                  {confirmPin.map((digit, index) => (
                    <input
                      key={`confirm-${index}`}
                      ref={(el) => { if (el) pinInputRefs[index].confirm = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, 'confirm')}
                      onKeyDown={(e) => handlePinKeyDown(e, index, 'confirm')}
                      className="w-16 h-20 text-center text-2xl font-bold bg-white/5 border-2 border-white/10 dark:text-white light:text-zinc-900 rounded-2xl focus:bg-white/10 focus:border-white/30 transition-all outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* PIN Match Indicator */}
              {newPin.join('').length === 6 && confirmPin.join('').length === 6 && (
                <div className={`text-sm font-medium text-center ${newPin.join('') === confirmPin.join('') ? 'text-green-400' : 'text-red-400'}`}>
                  {newPin.join('') === confirmPin.join('') ? '✓ PIN kodları eşleşiyor' : '✗ PIN kodları eşleşmiyor'}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleSavePin}
                  disabled={isSaving || newPin.join('').length !== 6 || confirmPin.join('').length !== 6}
                  className="w-full dark:bg-white dark:text-black light:bg-zinc-900 light:text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      PIN&apos;i Kaydet
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setViewMode("profile");
                    setNewPin(["", "", "", "", "", ""]);
                    setConfirmPin(["", "", "", "", "", ""]);
                  }}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white light:text-zinc-900 hover:bg-white/10 transition-colors"
                >
                  Vazgeç
                </button>
              </div>
            </div>
            </div>
          )}
      </motion.div>
    </motion.div>
  );
}
