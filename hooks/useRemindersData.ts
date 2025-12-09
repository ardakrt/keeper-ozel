import { useState, useCallback, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { createReminder, deleteReminder as deleteReminderAction, toggleReminderStatus as toggleReminderAction } from "@/app/actions";

export type Reminder = {
  id: string;
  title: string;
  content?: string;
  due_at?: string;
  due_date?: string; // Backward compatibility
  category?: string;
  channel?: string;
  is_completed?: boolean;
};

export function useRemindersData() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createBrowserClient();

  const loadReminders = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('due_at', { ascending: true }); // Prefer due_at for sorting

    if (error) {
      console.error('Error loading reminders:', error);
      toast.error('Hatırlatmalar yüklenemedi');
    } else {
      setReminders(data || []);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const addReminder = async (formData: FormData) => {
    try {
      await createReminder(formData);
      await loadReminders();
      toast.success('Hatırlatma eklendi');
      return true;
    } catch (error) {
      console.error('Add reminder error:', error);
      toast.error('Hatırlatma eklenemedi');
      return false;
    }
  };

  const deleteReminder = async (id: string) => {
    // Optimistic update
    setReminders(prev => prev.filter(r => r.id !== id));
    
    try {
      const formData = new FormData();
      formData.append('id', id);
      await deleteReminderAction(formData);
      toast.success('Hatırlatma silindi');
    } catch (error) {
      console.error('Delete reminder error:', error);
      toast.error('Hatırlatma silinemedi');
      await loadReminders(); // Revert on error
    }
  };

  const toggleReminder = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, is_completed: !currentStatus } : r
    ));

    try {
      await toggleReminderAction(id, !currentStatus);
    } catch (error) {
      console.error('Toggle reminder error:', error);
      toast.error('Güncelleme başarısız');
      await loadReminders(); // Revert on error
    }
  };

  return {
    reminders,
    isLoading,
    searchQuery,
    setSearchQuery,
    loadReminders,
    addReminder,
    deleteReminder,
    toggleReminder
  };
}
