
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { getRemindersCache, isCacheFresh } from '@/components/DataPreloader';
import { useAppStore } from '@/lib/store/useAppStore';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const RemindersPageManager = dynamic(() => import('@/components/RemindersPageManager'), {
  loading: () => <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>,
  ssr: false
});

export default function RemindersPage() {
  const { reminders: storeReminders, isLoaded, user: storeUser, setReminders: setStoreReminders } = useAppStore();
  const [reminders, setReminders] = useState<any[]>(storeReminders || []);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (isLoaded) {
      setReminders(storeReminders);
    }
  }, [isLoaded, storeReminders]);

  const loadReminders = useCallback(async (force: boolean = false) => {
    if (!force && isLoaded) return;

    // Fallback: Try to get user ID
    let userId = storeUser?.id;
    if (!userId) {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
         // router.push('/login'); // Layout handles this
         return;
       }
       userId = user.id;
    }

    // Check cache first for instant load (only if not forced)
    if (!force) {
        const cachedReminders = getRemindersCache(userId);
        if (cachedReminders && cachedReminders.length > 0) {
            setReminders(cachedReminders);
            setStoreReminders(cachedReminders); // Sync store

            if (isCacheFresh('reminders', userId)) {
                return;
            }
        }
    }

    // No cache or stale or forced, load normally
    const { data: remindersData } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('due_at', { ascending: true }); // Fixed ordering key to match schema

    if (remindersData) {
        setReminders(remindersData);
        setStoreReminders(remindersData); // Sync store
    }
  }, [supabase, isLoaded, storeUser, setStoreReminders]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  return (
    <div className="w-full h-full pt-6">
      <RemindersPageManager reminders={reminders} onRefresh={() => loadReminders(true)} />
    </div>
  );
}
