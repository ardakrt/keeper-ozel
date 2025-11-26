
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import NotesPageManager from '@/components/NotesPageManager';
import { useRouter } from 'next/navigation';
import { getNotesCache } from '@/components/DataPreloader';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient();
  const router = useRouter();

  const loadNotes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check cache first for instant load
    // Pass userId to get persistent cache
    const cachedNotes = getNotesCache(user.id);

    if (cachedNotes && cachedNotes.length > 0) {
      setNotes(cachedNotes);
      setIsLoading(false);

      // Only fetch in background if cache is stale (> 5 mins)
      // This prevents unnecessary network requests on every navigation
      const { isCacheFresh } = await import('@/components/DataPreloader');
      if (isCacheFresh('notes', user.id)) {
        console.log("📝 Using fresh cache for notes");
        return;
      }
      console.log("📝 Cache stale, refreshing notes in background...");
    }

    // Fetch fresh data
    const { data: notesData } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (notesData) {
      setNotes(notesData);
      // Update cache manually if needed, though DataPreloader does this too
    }
    setIsLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return (
    <div className="w-full h-full">
      <NotesPageManager notes={notes} onRefresh={loadNotes} />
    </div>
  );
}
