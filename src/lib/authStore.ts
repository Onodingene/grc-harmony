import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'control_owner' | 'tester' | 'viewer';
}

export interface AuthCompany {
  id: string;
  name: string;
}

interface AuthStore {
  user: AuthUser | null;
  company: AuthCompany | null;
  isReady: boolean;
  setAuth: (user: AuthUser, company: AuthCompany) => void;
  clearAuth: () => void;
  setReady: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  company: null,
  isReady: false,
  setAuth: (user, company) => set({ user, company }),
  clearAuth: () => set({ user: null, company: null }),
  setReady: () => set({ isReady: true }),
}));