"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccentColor } from "@/contexts/AccentColorContext";
import CustomSelect from "@/components/CustomSelect";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { accentColor, setAccentColor } = useAccentColor();
  const [language, setLanguage] = useState("tr");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Başlık */}
      <h1 className="text-3xl font-bold text-white dark:text-white light:text-zinc-900 mb-2">Ayarlar</h1>
      <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-sm mb-8">Uygulamanızı kişiselleştirin ve tercihlerinizi yönetin</p>

      {/* Ayarlar Kartları */}
      <div className="space-y-6">
        {/* Genel Ayarlar */}
        <div className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-white backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300 rounded-2xl p-6 shadow-lg dark:shadow-none light:shadow-xl">
          <h2 className="text-xl font-bold text-white dark:text-white light:text-zinc-900 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            Genel Ayarlar
          </h2>

          <div className="space-y-4">
            {/* Tema Seçimi */}
            <div className="flex items-center justify-between gap-6 py-3 px-4 bg-black/30 dark:bg-black/30 light:bg-white/30 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-300/50">
              <div>
                <p className="text-white dark:text-white light:text-zinc-900 font-medium text-sm">Tema</p>
                <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-xs mt-0.5">Arayüz görünümünüzü seçin</p>
              </div>
              <div className="w-48">
                <CustomSelect
                  value={theme}
                  onChange={(v) => setTheme(v as "light" | "dark")}
                  options={[
                    { label: "Açık", value: "light" },
                    { label: "Koyu", value: "dark" },
                  ]}
                />
              </div>
            </div>

            {/* Dil Seçimi */}
            <div className="flex items-center justify-between gap-6 py-3 px-4 bg-black/30 dark:bg-black/30 light:bg-white/30 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-300/50">
              <div>
                <p className="text-white dark:text-white light:text-zinc-900 font-medium text-sm">Dil</p>
                <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-xs mt-0.5">Uygulama dilini değiştirin</p>
              </div>
              <div className="w-48">
                <CustomSelect
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { label: "Türkçe", value: "tr" },
                    { label: "English", value: "en" },
                  ]}
                />
              </div>
            </div>

            {/* Vurgu Rengi */}
            <div className="py-3 px-4 bg-black/30 dark:bg-black/30 light:bg-white/30 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-300/50">
              <p className="text-white dark:text-white light:text-zinc-900 font-medium text-sm mb-2">Vurgu Rengi</p>
              <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-xs mb-4">Kartlar için renk teması seçin</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAccentColor("#3b82f6")}
                  className={`w-14 h-14 rounded-xl transition-all ${
                    accentColor === "#3b82f6"
                      ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900 light:ring-offset-white scale-110"
                      : "hover:scale-105 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: "#3b82f6" }}
                  title="Mavi"
                />
                <button
                  onClick={() => setAccentColor("#10b981")}
                  className={`w-14 h-14 rounded-xl transition-all ${
                    accentColor === "#10b981"
                      ? "ring-2 ring-offset-2 ring-green-500 dark:ring-offset-zinc-900 light:ring-offset-white scale-110"
                      : "hover:scale-105 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: "#10b981" }}
                  title="Yeşil"
                />
                <button
                  onClick={() => setAccentColor("#ef4444")}
                  className={`w-14 h-14 rounded-xl transition-all ${
                    accentColor === "#ef4444"
                      ? "ring-2 ring-offset-2 ring-red-500 dark:ring-offset-zinc-900 light:ring-offset-white scale-110"
                      : "hover:scale-105 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: "#ef4444" }}
                  title="Kırmızı"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Güvenlik Ayarları */}
        <div className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-white backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300 rounded-2xl p-6 shadow-lg dark:shadow-none light:shadow-xl">
          <h2 className="text-xl font-bold text-white dark:text-white light:text-zinc-900 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            Güvenlik
          </h2>

          <div className="space-y-4">
            {/* Otomatik Çıkış */}
            <div className="flex items-center justify-between py-3 px-4 bg-black/30 dark:bg-black/30 light:bg-white/30 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-300/50">
              <div>
                <p className="text-white dark:text-white light:text-zinc-900 font-medium text-sm">Otomatik Çıkış</p>
                <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-xs mt-0.5">Belirli süre sonra otomatik çıkış yap</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" disabled />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 opacity-50"></div>
              </label>
            </div>

            {/* İki Faktörlü Kimlik Doğrulama */}
            <div className="flex items-center justify-between py-3 px-4 bg-black/30 dark:bg-black/30 light:bg-white/30 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-300/50">
              <div>
                <p className="text-white dark:text-white light:text-zinc-900 font-medium text-sm">İki Faktörlü Doğrulama</p>
                <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-xs mt-0.5">Ekstra güvenlik katmanı ekleyin</p>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-500 dark:text-zinc-500 light:text-zinc-600 rounded-lg text-sm font-medium border border-white/10 dark:border-white/10 light:border-zinc-300 cursor-not-allowed"
              >
                Yakında
              </button>
            </div>
          </div>
        </div>

        {/* Bildirimler */}
        <div className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-white backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300 rounded-2xl p-6 shadow-lg dark:shadow-none light:shadow-xl">
          <h2 className="text-xl font-bold text-white dark:text-white light:text-zinc-900 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            Bildirimler
          </h2>

          <div className="space-y-4">
            {/* E-posta Bildirimleri */}
            <div className="flex items-center justify-between py-3 px-4 bg-black/30 dark:bg-black/30 light:bg-white/30 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-300/50">
              <div>
                <p className="text-white dark:text-white light:text-zinc-900 font-medium text-sm">E-posta Bildirimleri</p>
                <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-xs mt-0.5">Önemli güncellemeler için e-posta alın</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 opacity-50"></div>
              </label>
            </div>

            {/* Push Bildirimleri */}
            <div className="flex items-center justify-between py-3 px-4 bg-black/30 dark:bg-black/30 light:bg-white/30 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-300/50">
              <div>
                <p className="text-white dark:text-white light:text-zinc-900 font-medium text-sm">Push Bildirimleri</p>
                <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-xs mt-0.5">Tarayıcı bildirimleri</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" disabled />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Hakkında */}
        <div className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-white backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-300 rounded-2xl p-6 shadow-lg dark:shadow-none light:shadow-xl">
          <h2 className="text-xl font-bold text-white dark:text-white light:text-zinc-900 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            Hakkında
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-sm">Versiyon</p>
              <p className="text-white dark:text-white light:text-zinc-900 font-mono text-sm">1.0.0</p>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-white/5 dark:border-white/5 light:border-zinc-300">
              <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-sm">Geliştirici</p>
              <p className="text-white dark:text-white light:text-zinc-900 text-sm">Keeper Team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
