import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "control_owner" | "tester" | "viewer";
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      isReady: false,

      setAuth: (user, company) => set({ user, company, isReady: true }),

      clearAuth: () => set({ user: null, company: null, isReady: true }),

      setReady: () => set({ isReady: true }),
    }),
    {
      name: "auth-storage",

      partialize: (state) => ({
        user: state.user,
        company: state.company,
      }),
    }
  )
);
