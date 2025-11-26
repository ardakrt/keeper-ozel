"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type AccentColor = "#3b82f6" | "#10b981" | "#ef4444"; // blue, green, red

interface AccentColorContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(undefined);

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>("#3b82f6");
  const [mounted, setMounted] = useState(false);
  const supabase = createBrowserClient();

  // İlk yüklemede Supabase'den accent color oku
  useEffect(() => {
    setMounted(true);

    async function loadAccentColor() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("accent_color")
          .eq("user_id", user.id)
          .single();

        if (prefs?.accent_color) {
          setAccentColorState(prefs.accent_color as AccentColor);
        }
      }
    }

    loadAccentColor();
  }, [supabase]);

  // Accent color değiştiğinde CSS variable'a kaydet
  useEffect(() => {
    if (!mounted) return;

    document.documentElement.style.setProperty("--accent-color", accentColor);
  }, [accentColor, mounted]);

  const setAccentColor = async (newColor: AccentColor) => {
    setAccentColorState(newColor);

    // Supabase'e kaydet
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("user_preferences")
          .upsert(
            { user_id: user.id, accent_color: newColor },
            { onConflict: "user_id" }
          );
      }
    } catch (error) {
      console.error("Accent color update error:", error);
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentColorContext);
  if (context === undefined) {
    throw new Error("useAccentColor must be used within an AccentColorProvider");
  }
  return context;
}
