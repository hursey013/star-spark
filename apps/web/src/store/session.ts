import { create } from 'zustand';

import { api } from '../lib/api';

export type Cadence = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  email: string;
  notificationEmail: string;
  cadence: Cadence;
  filters: Record<string, unknown> | null;
  lastDigestSentAt: string | null;
}

type SessionStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface SessionState {
  user: User | null;
  status: SessionStatus;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  status: 'idle',
  async fetchUser() {
    set({ status: 'loading' });
    try {
      const response = await api.get<{ user: User | null }>('/api/auth/me');
      const user = response.data.user;
      set({ user, status: user ? 'authenticated' : 'unauthenticated' });
    } catch (error) {
      console.error('Failed to fetch session', error);
      set({ user: null, status: 'unauthenticated' });
    }
  },
  setUser(user) {
    set({ user, status: user ? 'authenticated' : 'unauthenticated' });
  },
  clearUser() {
    set({ user: null, status: 'unauthenticated' });
  }
}));
