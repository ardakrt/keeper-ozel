import { create } from 'zustand';
import { createBrowserClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

type UserState = {
  user: User | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  fetchUser: async () => {
    const supabase = createBrowserClient();
    await supabase.auth.refreshSession();
    const { data: { user } } = await supabase.auth.getUser();
    set({ user });
  },
  setUser: (user) => set({ user }),
}));
