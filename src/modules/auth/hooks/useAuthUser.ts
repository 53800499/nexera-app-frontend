"use client";

import { useAuthStore } from "../store/authStore";
import type { AuthUser } from "../types/auth.types";

/**
 * Utilisateur courant pour l'UI (permissions, nav, etc.).
 * Retourne null tant que la session n'est pas initialisée côté client,
 * afin d'éviter les écarts d'hydratation avec le HTML SSR.
 */
export function useAuthUser(): AuthUser | null {
  const user = useAuthStore((state) => state.user);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  return isSessionReady ? user : null;
}
