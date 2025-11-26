'use client';

import { useState, useEffect } from 'react';
import { X, Sun, Moon, Globe, Bell, Shield, Loader2, Check, Share2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { updateNotificationSettings, deleteUserAccount } from '@/app/actions';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

type SettingsSection = 'appearance' | 'language' | 'notifications' | 'privacy';

export default function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('tr');

  // Notification States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [shareData, setShareData] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

    setIsDeleting(true);
    try {
      await deleteUserAccount();
      // Redirect is handled in server action
    } catch (error) {
      console.error(error);
      toast.error('Hesap silinemedi');
      setIsDeleting(false);
    }
  };

  // Initialize settings from user metadata
  useEffect(() => {
    if (user?.user_metadata?.notification_settings) {
      const settings = user.user_metadata.notification_settings;
      setEmailNotifications(settings.email_notifications ?? true);
      setMarketingEmails(settings.marketing_emails ?? false);
      setSecurityAlerts(settings.security_alerts ?? true);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    // Optimistic update
    if (key === 'email') setEmailNotifications(value);
    if (key === 'marketing') setMarketingEmails(value);
    if (key === 'security') setSecurityAlerts(value);

    setIsUpdatingNotifications(true);
    try {
      await updateNotificationSettings({
        email_notifications: key === 'email' ? value : emailNotifications,
        marketing_emails: key === 'marketing' ? value : marketingEmails,
        security_alerts: key === 'security' ? value : securityAlerts,
      });
      // toast.success('Ayarlar güncellendi'); // Optional: too many toasts might be annoying for toggles
    } catch (error) {
      console.error(error);
      toast.error('Ayarlar güncellenemedi');
      // Revert on error
      if (key === 'email') setEmailNotifications(!value);
      if (key === 'marketing') setMarketingEmails(!value);
      if (key === 'security') setSecurityAlerts(!value);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const navigationItems = [
    { id: 'appearance' as SettingsSection, label: 'Görünüm', icon: Sun },
    { id: 'language' as SettingsSection, label: 'Dil ve Bölge', icon: Globe },
    { id: 'notifications' as SettingsSection, label: 'Bildirimler', icon: Bell },
    { id: 'privacy' as SettingsSection, label: 'Gizlilik ve Güvenlik', icon: Shield },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Görünüm</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Uygulamanın görsel ayarlarını özelleştirin</p>
            </div>

            {/* Theme Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Tema</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Light Theme Card */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 ${theme === 'light'
                      ? 'bg-white dark:bg-white border-zinc-300 dark:border-white ring-2 ring-zinc-300 dark:ring-white/20 shadow-xl shadow-zinc-200 dark:shadow-white/5'
                      : 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${theme === 'light' ? 'bg-zinc-100 dark:bg-zinc-100 text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'
                        }`}>
                        <Sun className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className={`block text-sm font-semibold ${theme === 'light' ? 'text-black' : 'text-zinc-900 dark:text-white'
                          }`}>
                          Açık
                        </span>
                        <span className={`text-xs ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-600 dark:text-zinc-500'
                          }`}>
                          Klasik görünüm
                        </span>
                      </div>
                    </div>
                    {theme === 'light' && (
                      <div className="absolute top-4 right-4">
                        <div className="w-2 h-2 rounded-full bg-black" />
                      </div>
                    )}
                  </button>

                  {/* Dark Theme Card */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 ${theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 ring-2 ring-zinc-500 dark:ring-white/20 shadow-xl shadow-zinc-400 dark:shadow-black/50'
                      : 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'
                        }`}>
                        <Moon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className={`block text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-zinc-900 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'
                          }`}>
                          Koyu
                        </span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-500">
                          Göz yormayan mod
                        </span>
                      </div>
                    </div>
                    {theme === 'dark' && (
                      <div className="absolute top-4 right-4">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-8 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Dil ve Bölge</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Tercih ettiğiniz dili seçin</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">Arayüz Dili</label>
                <div className="relative group">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-14 pl-4 pr-10 bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-300 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white text-sm appearance-none cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 focus:border-zinc-400 dark:focus:border-white/30 focus:outline-none focus:ring-0 transition-all duration-200"
                  >
                    <option value="tr" className="bg-white dark:bg-zinc-900">Türkçe</option>
                    <option value="en" className="bg-white dark:bg-zinc-900">English</option>
                    <option value="de" className="bg-white dark:bg-zinc-900">Deutsch</option>
                    <option value="fr" className="bg-white dark:bg-zinc-900">Français</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Bildirimler</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Bildirim tercihlerinizi yönetin</p>
            </div>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-white">E-posta Bildirimleri</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-500">Önemli güncellemeler ve aktiviteler hakkında e-posta alın</p>
                </div>
                <button
                  onClick={() => handleNotificationUpdate('email', !emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${emailNotifications ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Security Alerts */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Güvenlik Uyarıları</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-500">Şüpheli girişler ve güvenlik olayları için bildirim alın</p>
                </div>
                <button
                  onClick={() => handleNotificationUpdate('security', !securityAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${securityAlerts ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${securityAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Marketing Emails */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Pazarlama ve Yenilikler</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-500">Yeni özellikler ve kampanyalardan haberdar olun</p>
                </div>
                <button
                  onClick={() => handleNotificationUpdate('marketing', !marketingEmails)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${marketingEmails ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${marketingEmails ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            {isUpdatingNotifications && (
              <div className="flex items-center justify-center text-xs text-zinc-600 dark:text-zinc-500 gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Ayarlar kaydediliyor...
              </div>
            )}
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-8 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Gizlilik ve Güvenlik</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Hesap güvenliğinizi yönetin</p>
            </div>

            <div className="space-y-6">
              {/* Share Data */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    <Share2 size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Verileri Keeper ile Paylaş</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-500">Uygulama deneyimini iyileştirmek için anonim kullanım verilerini paylaşın</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareData(!shareData)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${shareData ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${shareData ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Danger Zone */}
              <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 dark:border-red-500/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-500">Hesabı Sil</h3>
                    <p className="text-xs text-red-500/60">Bu işlem geri alınamaz ve tüm verileriniz silinir</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Hesabı Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-[850px] h-[600px] mx-4"
      >
        <div className="h-full bg-zinc-50/95 dark:bg-[#09090b] rounded-3xl border border-zinc-300/50 dark:border-white/10 shadow-2xl overflow-hidden flex backdrop-blur-xl">

          {/* LEFT PANEL - SIDEBAR */}
          <div className="w-[280px] bg-white/40 dark:bg-zinc-900/20 border-r border-zinc-300/50 dark:border-white/5 p-6 flex flex-col backdrop-blur-xl">
            {/* Header */}
            <div className="mb-10 px-2">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Ayarlar</h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">Uygulama tercihlerinizi yönetin</p>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg shadow-zinc-900/10 dark:shadow-white/5'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white dark:text-black' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'} transition-colors`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer - Version Info */}
            <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-white/5 px-2">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-600 text-center font-mono">Keeper v1.0.0</p>
            </div>
          </div>

          {/* RIGHT PANEL - CONTENT */}
          <div className="flex-1 flex flex-col bg-transparent dark:bg-[#09090b] relative">
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-12 pb-10 pt-14 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2,  }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>


          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      `}</style>
    </div>
  );
}
