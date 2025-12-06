"use client";

import Link from "next/link";
import NewCardForm from "@/components/NewCardForm";

export default function NewCardPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-black dark:bg-black light:bg-zinc-50 overflow-hidden">
      {/* God Rays - Üstten Gelen Parlak Spotlight (4 Katman) - Dark Mode Only */}
      <div className="fixed inset-0 pointer-events-none z-0 dark:block hidden">
        {/* 1. Mor (En Geniş Arka Plan) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2000px] h-[1200px] bg-purple-600 opacity-40 blur-[200px] rounded-full -translate-y-1/2" />

        {/* 2. Mavi (Ana Spotlight) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] bg-blue-600 opacity-50 blur-[180px] rounded-full -translate-y-1/3" />

        {/* 3. Cyan (Belirgin Odak) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-cyan-500 opacity-60 blur-[150px] rounded-full -translate-y-1/4" />

        {/* 4. Teal (En Parlak Odak - Form Üstü) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500 opacity-40 blur-[120px] rounded-full" />
      </div>

      {/* Light Mode Subtle Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 light:block hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-zinc-200/30 to-transparent blur-3xl rounded-full -translate-y-1/3" />
      </div>

      {/* Geri Dön Butonu - Sol Üst Köşe */}
      <Link
        href="/dashboard"
        className="fixed top-8 left-8 z-20 inline-flex items-center gap-2 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors group bg-white/5 dark:bg-white/5 light:bg-white backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 light:shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Geri Dön
      </Link>

      {/* Form Container - Glassmorphism */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <NewCardForm alwaysOpen={true} />
      </div>
    </div>
  );
}
