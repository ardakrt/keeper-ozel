"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { updateUserTheme } from "@/app/actions";
import { flushSync } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [transitionOverlay, setTransitionOverlay] = useState<{
    x: number;
    y: number;
    targetTheme: Theme;
  } | null>(null);

  const supabase = createBrowserClient();
  const userSetRef = useRef(false);

  // İlk yüklemede Supabase'den tema oku
  useEffect(() => {
    const root = document.documentElement;
    const initial: Theme = root.classList.contains("dark") ? "dark" : "light";
    setThemeState(initial);
    setMounted(true);

    async function loadTheme() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("theme_mode_web")
          .eq("user_id", user.id)
          .single();

        if (prefs?.theme_mode_web && !userSetRef.current) {
          setThemeState(prefs.theme_mode_web as Theme);
        }
      }
    }

    loadTheme();
  }, [supabase]);

  // Tema değiştiğinde HTML'e class ekle
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // View Transition veya Fallback Overlay kullanılıyorsa disable-transitions eklemeye gerek yok
    // Ancak normal state değişimleri için koruma
    if (!document.startViewTransition && !transitionOverlay) {
      root.classList.add("disable-transitions");
    }

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    if (!document.startViewTransition && !transitionOverlay) {
      setTimeout(() => {
        root.classList.remove("disable-transitions");
      }, 0);
    }
  }, [theme, mounted, transitionOverlay]);

  const toggleTheme = async (e?: React.MouseEvent) => {
    userSetRef.current = true;
    const newTheme = theme === "light" ? "dark" : "light";

    // Helper to update DB
    const updateDb = async () => {
      try {
        await updateUserTheme(newTheme);
      } catch (error) {
        console.error("Theme update error:", error);
      }
    };

    // 1. View Transition Support
    if (
      document.startViewTransition &&
      e &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const x = e.clientX;
      const y = e.clientY;
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setThemeState(newTheme);
        });
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });

      updateDb();
      return;
    }

    // 2. Fallback: Framer Motion Overlay
    if (e && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTransitionOverlay({
        x: e.clientX,
        y: e.clientY,
        targetTheme: newTheme
      });
      // Theme change happens after animation starts/completes in the overlay component logic
      // But for simplicity, we trigger it via timeout or callback.
      // Here we just set overlay, and let the overlay component drive the state change?
      // No, easier to just wait a bit or let the overlay cover first.

      // Actually, we can't easily wait here without blocking.
      // Let's change the theme immediately BUT hide the change behind the overlay?
      // No, if we change immediately, the background changes.
      // We need the overlay to be the NEW color, expanding over the OLD color.
      // Then we switch the underlying theme.

      setTimeout(() => {
        flushSync(() => {
          setThemeState(newTheme);
        });
        updateDb();
        // After theme change, we can clear the overlay after a delay or let it fade out
        setTimeout(() => {
          setTransitionOverlay(null);
        }, 500);
      }, 400); // Wait for overlay to cover most of the screen

      return;
    }

    // 3. No Animation (Reduced Motion or No Event)
    setThemeState(newTheme);
    updateDb();
  };

  const setTheme = async (newTheme: Theme) => {
    userSetRef.current = true;
    setThemeState(newTheme);

    try {
      await updateUserTheme(newTheme);
    } catch (error) {
      console.error("Theme update error:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}

      {/* Fallback Transition Overlay */}
      <AnimatePresence>
        {transitionOverlay && (
          <motion.div
            initial={{ clipPath: `circle(0px at ${transitionOverlay.x}px ${transitionOverlay.y}px)` }}
            animate={{ clipPath: `circle(150% at ${transitionOverlay.x}px ${transitionOverlay.y}px)` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
              backgroundColor: transitionOverlay.targetTheme === "dark" ? "#0a0a0a" : "#F9FAFB",
              pointerEvents: "none"
            }}
          />
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
