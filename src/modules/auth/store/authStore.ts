"use client";

import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

type AuthStoreState = {
  user: AuthUser | null;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  error: null,
  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
