import { create } from 'zustand';
import { PublicUser } from '../../shared/lib/zod-schemas';

interface AuthState {
  user: PublicUser | null;
  isLoading: boolean;
  setUser: (user: PublicUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null }),
}));
