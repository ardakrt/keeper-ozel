
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import RemindersPageManager from '@/components/RemindersPageManager';
import { useRouter } from 'next/navigation';
import { getRemindersCache } from '@/components/DataPreloader';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient();
  const router = useRouter();

  const loadReminders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check cache first for instant load
    const cachedReminders = getRemindersCache(user.id);
    if (cachedReminders && cachedReminders.length > 0) {
      setReminders(cachedReminders);
      setIsLoading(false);

      // Only fetch in background if cache is stale
      const { isCacheFresh } = await import('@/components/DataPreloader');
      if (isCacheFresh('reminders', user.id)) {
        console.log("⏰ Using fresh cache for reminders");
        return;
      }
    }

    // No cache or stale, load normally
    const { data: remindersData } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('reminder_date', { ascending: true });

    if (remindersData) setReminders(remindersData);
    setIsLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  return (
    <div className="w-full h-full pt-6">
      <RemindersPageManager reminders={reminders} onRefresh={loadReminders} />
    </div>
  );
}
