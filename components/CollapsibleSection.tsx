"use client";

import { useEffect, useState } from "react";

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  storageKey,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  storageKey?: string;
}) {
  const key = `collapsible:${storageKey ?? title}`;
  const [isOpen, setIsOpen] = useState<boolean | null>(storageKey ? null : defaultOpen);

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (saved !== null) setIsOpen(saved === "1");
      else if (isOpen === null) setIsOpen(defaultOpen);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const toggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        if (typeof window !== "undefined") localStorage.setItem(key, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <div className="light:border-zinc-200 dark:border-white/10 border rounded light:bg-white dark:bg-transparent p-4">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between text-left light:text-zinc-900 dark:text-white"
      >
        <span className="font-medium">{title}</span>
        <span className="ml-2 select-none light:text-zinc-600 dark:text-zinc-400">{(isOpen ?? defaultOpen) ? "▼" : "►"}</span>
      </button>
      {isOpen === true && <div className="mt-4">{children}</div>}
    </div>
  );
}
