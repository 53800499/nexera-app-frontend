"use client";

import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

type AuthStoreState = {
  user: AuthUser | null;
  error: string | null;
  isSessionReady: boolean;
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  setSessionReady: (ready: boolean) => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  error: null,
  isSessionReady: false,
  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  setSessionReady: (ready) => set({ isSessionReady: ready }),
  clearError: () => set({ error: null }),
}));
