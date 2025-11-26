"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Palette, Globe, Bell, Shield, Download, Trash2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import AccentColorPicker from "@/components/AccentColorPicker";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";


interface SettingsModalProps {
  onClose: () => void;
}

type SettingsCategory = "appearance" | "language" | "notifications" | "security";

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("appearance");
  const [language, setLanguage] = useState("tr");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareData: false,
  });

  const categories = [
    { id: "appearance" as SettingsCategory, label: "Görünüm", icon: Palette },
    { id: "language" as SettingsCategory, label: "Dil ve Bölge", icon: Globe },
    { id: "notifications" as SettingsCategory, label: "Bildirimler", icon: Bell },
    { id: "security" as SettingsCategory, label: "Gizlilik ve Güvenlik", icon: Shield },
  ];

  useEffect(() => {
    // Load user preferences
    const supabase = createBrowserClient();
    const loadPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load preferences from database if needed
      }
    };
    loadPreferences();
  }, []);

  const handleExportData = () => {
    // TODO: Implement data export
    toast.success("Verileriniz indiriliyor...");
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    if (confirm("Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      toast.success("Hesap silme işlemi başlatıldı.");
    }
  };

  const getCategoryTitle = () => {
    const category = categories.find(c => c.id === activeCategory);
    return category?.label || "";
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
      transition: { duration: 0.2,  } // Fast, simple, clean
    },
    // Modal exit
    exit: {
      opacity: 0,
      scale: 0.98, // Shrink back slightly
      transition: { duration: 0.15,  } // Exit even faster
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
        className="max-w-4xl w-full h-[600px] bg-[#050505]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grid Layout: 3 cols sidebar + 9 cols content */}
        <div className="grid grid-cols-12 h-full">
          {/* Sidebar - Left Column (col-span-3) */}
          <div className="col-span-3 border-r border-white/5 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Ayarlar</h2>
            </div>

            {/* Sidebar Navigation */}
            <div className="p-4 space-y-1 flex-1 overflow-y-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                      activeCategory === category.id
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area - Right Column (col-span-9) */}
          <div className="col-span-9 flex flex-col h-full overflow-hidden">
            {/* Content Header with Close Button */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-semibold text-white">{getCategoryTitle()}</h3>

              {/* Close Button - Top Right */}
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-zinc-600">
              {/* Appearance Category */}
              {activeCategory === "appearance" && (
                <div className="space-y-6">
                  {/* Theme Section */}
                  <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-white mb-4">Tema</h4>
                    <p className="text-sm text-zinc-400 mb-4">Arayüz görünümünü seçin</p>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="light">☀️ Açık</option>
                      <option value="dark">🌙 Koyu</option>
                    </select>
                  </div>

                  {/* Accent Color Section */}
                  <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-white mb-4">Vurgu Rengi</h4>
                    <p className="text-sm text-zinc-400 mb-4">Ana renk temasını özelleştirin</p>
                    <AccentColorPicker />
                  </div>
                </div>
              )}

              {/* Language Category */}
              {activeCategory === "language" && (
                <div className="space-y-6">
                  {/* Language Section */}
                  <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-white mb-4">Uygulama Dili</h4>
                    <p className="text-sm text-zinc-400 mb-4">Arayüz dilini değiştirin</p>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="tr">🇹🇷 Türkçe</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="fr">🇫🇷 Français</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Notifications Category */}
              {activeCategory === "notifications" && (
                <div className="space-y-6">
                  {/* Notification Preferences Section */}
                  <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-white mb-4">Bildirim Tercihleri</h4>
                    <p className="text-sm text-zinc-400 mb-6">Almak istediğiniz bildirimleri seçin</p>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <div>
                          <p className="text-sm font-medium text-white">E-posta Bildirimleri</p>
                          <p className="text-xs text-zinc-400 mt-1">Önemli güncellemeleri e-posta ile alın</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <div>
                          <p className="text-sm font-medium text-white">Push Bildirimleri</p>
                          <p className="text-xs text-zinc-400 mt-1">Mobil ve masaüstü bildirimleri</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.push}
                            onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-white">Hatırlatıcılar</p>
                          <p className="text-xs text-zinc-400 mt-1">Zamanlı hatırlatma bildirimleri</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.reminders}
                            onChange={(e) => setNotifications({ ...notifications, reminders: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Category */}
              {activeCategory === "security" && (
                <div className="space-y-6">
                  {/* Privacy Settings Section */}
                  <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-white mb-4">Gizlilik Ayarları</h4>
                    <p className="text-sm text-zinc-400 mb-6">Hesap gizliliğinizi kontrol edin</p>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <div>
                          <p className="text-sm font-medium text-white">Profil Görünürlüğü</p>
                          <p className="text-xs text-zinc-400 mt-1">Profilinizin diğer kullanıcılara görünürlüğü</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy.profileVisible}
                            onChange={(e) => setPrivacy({ ...privacy, profileVisible: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-white">Veri Paylaşımı</p>
                          <p className="text-xs text-zinc-400 mt-1">Anonim kullanım verilerini paylaş</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy.shareData}
                            onChange={(e) => setPrivacy({ ...privacy, shareData: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Data Management Section */}
                  <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-white mb-4">Veri Yönetimi</h4>
                    <p className="text-sm text-zinc-400 mb-6">Verilerinizi yönetin ve kontrol edin</p>

                    <div className="space-y-3">
                      <button
                        onClick={handleExportData}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-blue-500 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Download className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-white">Verilerimi İndir</p>
                            <p className="text-xs text-zinc-400 mt-1">Tüm verilerinizi JSON formatında indirin</p>
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button
                        onClick={handleDeleteAccount}
                        className="w-full bg-red-950/20 border border-red-900/50 rounded-xl p-4 flex items-center justify-between hover:border-red-500 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-red-500">Hesabı Sil</p>
                            <p className="text-xs text-red-400/70 mt-1">Hesabınızı kalıcı olarak silin</p>
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500/50 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
