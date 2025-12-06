"use client";

import { useTransition } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const onLight = () => startTransition(() => setTheme("light"));
  const onDark = () => startTransition(() => setTheme("dark"));

  const baseBtn =
    "relative px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all";

  const lightActive =
    "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm";
  const lightInactive =
    "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10";

  return (
    <div className="inline-flex items-center bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-xl p-1 shadow-sm">
      <button
        type="button"
        onClick={onLight}
        disabled={isPending}
        aria-pressed={theme === "light"}
        className={`${baseBtn} ${theme === "light" ? lightActive : lightInactive}`}
      >
        <span className="inline-flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 6.95l-1.414-1.414M7.464 7.464 6.05 6.05m11.486 0-1.414 1.414M7.464 16.536 6.05 17.95M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <span className="hidden sm:inline">Açık</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDark}
        disabled={isPending}
        aria-pressed={theme === "dark"}
        className={`${baseBtn} ${theme === "dark" ? lightActive : lightInactive}`}
      >
        <span className="inline-flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          <span className="hidden sm:inline">Koyu</span>
        </span>
      </button>
    </div>
  );
}
