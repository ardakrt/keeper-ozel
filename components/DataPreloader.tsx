"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = "keeper_cache_";

// Types
type CacheItem<T> = {
  data: T;
  timestamp: number;
  userId: string;
};

// Helper to get cache from localStorage
function getFromCache<T>(key: string, userId: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}_${userId}`);
    if (!raw) return null;

    const item: CacheItem<T> = JSON.parse(raw);

    // Check if valid and belongs to current user
    if (item.userId !== userId) return null;

    // Return data regardless of age (stale-while-revalidate pattern)
    // The consumer decides if it's too old
    return item.data;
  } catch (e) {
    console.error(`Error reading ${key} cache:`, e);
    return null;
  }
}

// Helper to set cache to localStorage
function setCache<T>(key: string, data: T, userId: string) {
  if (typeof window === 'undefined') return;

  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      userId
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}_${userId}`, JSON.stringify(item));

    // Also update memory cache for faster access
    (window as any)[`__${key}Cache`] = data;
    (window as any)[`__${key}Timestamp`] = Date.now();
  } catch (e) {
    console.error(`Error writing ${key} cache:`, e);
  }
}

// Helper to check if cache is fresh (not stale)
export function isCacheFresh(key: string, userId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}_${userId}`);
    if (!raw) return false;

    const item: CacheItem<any> = JSON.parse(raw);
    return Date.now() - item.timestamp < CACHE_DURATION;
  } catch {
    return false;
  }
}

// Exported getters
export function getNotesCache(userId?: string): any[] | null {
  if (!userId && typeof window !== 'undefined') {
    // Try to find any user's cache if ID not provided (fallback)
    // In real usage, userId should be passed
    return (window as any).__notesCache || null;
  }
  return userId ? getFromCache('notes', userId) : null;
}

export function getCardsCache(userId?: string): any[] | null {
  return userId ? getFromCache('cards', userId) : null;
}

export function getIbansCache(userId?: string): any[] | null {
  return userId ? getFromCache('ibans', userId) : null;
}

export function getRemindersCache(userId?: string): any[] | null {
  return userId ? getFromCache('reminders', userId) : null;
}

export function getAccountsCache(userId?: string): any[] | null {
  return userId ? getFromCache('accounts', userId) : null;
}

export function getTodosCache(userId?: string): any[] | null {
  return userId ? getFromCache('todos', userId) : null;
}

export function getDriveFilesCache(userId?: string): any | null {
  return userId ? getFromCache('drive_files', userId) : null;
}

export function getDriveStorageCache(userId?: string): any | null {
  return userId ? getFromCache('drive_storage', userId) : null;
}

export default function DataPreloader() {
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise small timeout
    const startPreload = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => preloadAllData());
      } else {
        setTimeout(preloadAllData, 100);
      }
    };

    startPreload();
  }, []);

  const preloadAllData = async () => {
    try {
      const supabase = createBrowserClient();

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Preload all data types in parallel
      // We only fetch if cache is stale (> 5 mins)
      // This significantly reduces API calls on page navigation

      const tasks = [];

      if (!isCacheFresh('notes', user.id)) tasks.push(preloadNotes(supabase, user.id));
      if (!isCacheFresh('cards', user.id)) tasks.push(preloadCards(supabase, user.id));
      if (!isCacheFresh('ibans', user.id)) tasks.push(preloadIbans(supabase, user.id));
      if (!isCacheFresh('reminders', user.id)) tasks.push(preloadReminders(supabase, user.id));
      if (!isCacheFresh('accounts', user.id)) tasks.push(preloadAccounts(supabase, user.id));
      if (!isCacheFresh('todos', user.id)) tasks.push(preloadTodos(supabase, user.id));
      if (!isCacheFresh('drive_files', user.id)) tasks.push(preloadDriveFiles(user.id));

      if (tasks.length > 0) {
        console.log(`🚀 Refreshing ${tasks.length} stale data categories...`);
        await Promise.all(tasks);
        console.log("✅ Background data refresh complete");
      } else {
        console.log("✨ All data is fresh, skipping network requests");
      }
    } catch (error) {
      console.error("Preload failed:", error);
    }
  };

  const preloadNotes = async (supabase: any, userId: string) => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setCache('notes', data, userId);
    }
  };

  const preloadCards = async (supabase: any, userId: string) => {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCache('cards', data, userId);
    }
  };

  const preloadIbans = async (supabase: any, userId: string) => {
    const { data, error } = await supabase
      .from("ibans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCache('ibans', data, userId);
    }
  };

  const preloadReminders = async (supabase: any, userId: string) => {
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .order("due_at", { ascending: true });

    if (!error && data) {
      setCache('reminders', data, userId);
    }
  };

  const preloadAccounts = async (supabase: any, userId: string) => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCache('accounts', data, userId);
    }
  };

  const preloadTodos = async (supabase: any, userId: string) => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCache('todos', data, userId);
    }
  };

  const preloadDriveFiles = async (userId: string) => {
    try {
      const res = await fetch('/api/drive/files?folderId=root');
      const data = await res.json();
      if (data.files) {
        setCache('drive_files', data.files, userId);
        if (data.storage) {
          setCache('drive_storage', data.storage, userId);
        }
      }
    } catch (error) {
      console.error('Drive preload failed:', error);
    }
  };

  return null;
}

// Helper to invalidate cache after mutations
export function invalidateCache(type: 'notes' | 'cards' | 'ibans' | 'reminders' | 'accounts' | 'todos' | 'drive_files' | 'drive_storage' | 'all') {
  if (typeof window === 'undefined') return;

  // We can't easily delete specific user keys without knowing userId here
  // So we'll implement a "soft" invalidation by clearing the memory cache
  // and trying to clear localStorage if we can find the key

  // Ideally, we should pass userId to this function, but for now let's iterate
  // or just rely on the next fetch updating the cache

  const clearKey = (key: string) => {
    // Find keys starting with prefix
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${CACHE_PREFIX}${key}_`)) {
        localStorage.removeItem(k);
      }
    }
    delete (window as any)[`__${key}Cache`];
  };

  if (type === 'all') {
    ['notes', 'cards', 'ibans', 'reminders', 'accounts', 'todos', 'drive_files', 'drive_storage'].forEach(clearKey);
  } else {
    clearKey(type);
  }
}
