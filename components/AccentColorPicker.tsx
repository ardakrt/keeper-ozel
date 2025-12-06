"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserAccentColor } from "@/app/actions";

const COLORS = ["#3b82f6", "#10b981", "#ef4444"] as const;

export default function AccentColorPicker({ currentColor }: { currentColor?: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const selected = (currentColor && COLORS.includes(currentColor as any) ? currentColor : currentColor) || "#3b82f6";

  const onPick = (c: string) => {
    if (isPending) return;
    startTransition(async () => {
      await updateUserAccentColor(c);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium light:text-zinc-900 dark:text-white">Vurgu Rengi</h3>
      <div className="flex items-center gap-4">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Renk ${c}`}
            onClick={() => onPick(c)}
            className={`w-10 h-10 rounded-full border-2 border-zinc-200 cursor-pointer transition-all hover:scale-110 ${
              selected === c ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-white" : ""
            }`}
            style={{ backgroundColor: c }}
            disabled={isPending}
          />
        ))}
      </div>
    </div>
  );
}
