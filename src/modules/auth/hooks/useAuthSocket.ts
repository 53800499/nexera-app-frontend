"use client";

import { useEffect } from "react";
import { authSocket } from "../services/authSocket.service";
import { tokenStorage } from "../services/tokenStorage.service";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "./useAuth";

export function useAuthSocket() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  useEffect(() => {
    if (!user) {
      authSocket.disconnect();
      return;
    }

    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) return;

    authSocket.onRevoked(() => {
      void logout();
    });
    authSocket.connect(accessToken);

    return () => {
      authSocket.disconnect();
    };
  }, [user, logout]);
}
