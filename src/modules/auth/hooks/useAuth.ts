"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/shared/hooks/useIsClient";
import { AppError } from "@/shared/core/AppError";
import { OfflineError } from "@/shared/core/OfflineError";
import { AUTH_QUERY_KEYS, AUTH_ROUTES } from "../constants/routes";
import { authApi } from "../services/authApi.service";
import { logAuthAudit } from "../services/authAudit.service";
import { tokenStorage } from "../services/tokenStorage.service";
import { useAuthStore } from "../store/authStore";
import type {
  LoginCredentials,
  RegisterDirigeantData,
} from "../types/auth.types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isClient = useIsClient();
  const user = useAuthStore((s) => s.user);
  const error = useAuthStore((s) => s.error);
  const setUser = useAuthStore((s) => s.setUser);
  const setError = useAuthStore((s) => s.setError);
  const setSessionReady = useAuthStore((s) => s.setSessionReady);
  const isSessionReady = useAuthStore((s) => s.isSessionReady);
  const clearError = useAuthStore((s) => s.clearError);

  useEffect(() => {
    const storedUser = tokenStorage.getStoredUser();
    const accessToken = tokenStorage.getAccessToken();
    if (storedUser && accessToken && !useAuthStore.getState().user) {
      setUser(storedUser);
    }
  }, [setUser]);

  const sessionQuery = useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => authApi.getCurrentSession(),
    enabled: isClient,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    networkMode: "always",
    retry: false,
  });

  useEffect(() => {
    if (!isClient) return;

    if (sessionQuery.isPending) {
      setSessionReady(false);
      return;
    }

    if (sessionQuery.data?.user) {
      setUser(sessionQuery.data.user);
    } else if (sessionQuery.isSuccess && !sessionQuery.data) {
      setUser(null);
    }

    setSessionReady(true);
  }, [
    isClient,
    sessionQuery.data,
    sessionQuery.isPending,
    sessionQuery.isSuccess,
    setSessionReady,
    setUser,
  ]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDirigeantData) =>
      authApi.registerDirigeant(data),
  });

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setError(null);
    setSessionReady(false);
    queryClient.clear();

    void logAuthAudit({
      action: "logout",
      status: "success",
      createdAt: Date.now(),
    });

    window.location.assign(AUTH_ROUTES.signIn);
  }, [queryClient, setError, setSessionReady, setUser]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      clearError();
      try {
        const session = await loginMutation.mutateAsync(credentials);
        setUser(session.user);
        setSessionReady(true);
        await logAuthAudit({
          action: "login",
          email: credentials.email,
          status: "success",
          createdAt: Date.now(),
        });
        const redirectPath = authApi.getRedirectPath(session);
        router.push(redirectPath);
        return redirectPath;
      } catch (err) {
        const message =
          err instanceof OfflineError
            ? "Connexion impossible : vérifiez votre réseau ou que le serveur API est démarré."
            : err instanceof AppError
              ? err.message
              : "Impossible de se connecter";
        setError(message);
        await logAuthAudit({
          action: "login",
          email: credentials.email,
          status: "error",
          message,
          createdAt: Date.now(),
        });
        throw err;
      }
    },
    [clearError, loginMutation, router, setError, setSessionReady, setUser],
  );

  const register = useCallback(
    async (data: RegisterDirigeantData) => {
      clearError();
      try {
        const session = await registerMutation.mutateAsync(data);
        setUser(session.user);
        setSessionReady(true);
        await logAuthAudit({
          action: "register",
          email: data.email,
          status: "success",
          createdAt: Date.now(),
        });
        const redirectPath = authApi.getRedirectPath(session);
        router.push(redirectPath);
        return redirectPath;
      } catch (err) {
        const message =
          err instanceof AppError
            ? err.message
            : "Impossible de créer le compte";
        setError(message);
        await logAuthAudit({
          action: "register",
          email: data.email,
          status: "error",
          message,
          createdAt: Date.now(),
        });
        throw err;
      }
    },
    [clearError, registerMutation, router, setError, setSessionReady, setUser],
  );

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading:
      (isClient && (sessionQuery.isPending || !isSessionReady)) ||
      loginMutation.isPending ||
      registerMutation.isPending,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
