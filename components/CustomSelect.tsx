"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Option = { label: string; value: string };

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seçiniz",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => options.find(o => o.value === value), [options, value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm font-medium hover:border-zinc-300 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-100"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${selected ? "text-zinc-900" : "text-zinc-500"}`}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-zinc-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 w-full bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden">
          <ul role="listbox" className="max-h-64 overflow-auto py-1">
            {options.map(opt => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      active
                        ? "font-semibold text-black bg-zinc-50"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="truncate">{opt.label}</span>
                    {active && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-zinc-900"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
