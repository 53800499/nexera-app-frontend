"use client";

import { useAuthStore } from "@/modules/auth/store/authStore";
import { useIsClient } from "./useIsClient";

/** Attend la fin du bootstrap session (sync profil + refresh JWT) avant les requêtes API. */
export function useQueryEnabled(extraEnabled = true): boolean {
  const isClient = useIsClient();
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  return isClient && isSessionReady && extraEnabled;
}
