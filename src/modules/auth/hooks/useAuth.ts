"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AppError } from "@/shared/core/AppError";
import { AUTH_QUERY_KEYS, AUTH_ROUTES } from "../constants/routes";
import { authApi } from "../services/authApi.service";
import { logAuthAudit } from "../services/authAudit.service";
import { useAuthStore } from "../store/authStore";
import type {
  LoginCredentials,
  RegisterDirigeantData,
} from "../types/auth.types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const error = useAuthStore((s) => s.error);
  const setUser = useAuthStore((s) => s.setUser);
  const setError = useAuthStore((s) => s.setError);
  const clearError = useAuthStore((s) => s.clearError);

  const sessionQuery = useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => authApi.getCurrentSession(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (sessionQuery.data?.user) {
      setUser(sessionQuery.data.user);
    } else if (sessionQuery.isSuccess && !sessionQuery.data) {
      setUser(null);
    }
  }, [sessionQuery.data, sessionQuery.isSuccess, setUser]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDirigeantData) =>
      authApi.registerDirigeant(data),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      authApi.logout();
    },
  });

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      clearError();
      try {
        const session = await loginMutation.mutateAsync(credentials);
        setUser(session.user);
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
          err instanceof AppError ? err.message : "Impossible de se connecter";
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
    [clearError, loginMutation, router, setError, setUser],
  );

  const register = useCallback(
    async (data: RegisterDirigeantData) => {
      clearError();
      try {
        const session = await registerMutation.mutateAsync(data);
        setUser(session.user);
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
    [clearError, registerMutation, router, setError, setUser],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    setUser(null);
    setError(null);
    await logAuthAudit({
      action: "logout",
      status: "success",
      createdAt: Date.now(),
    });
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    router.push(AUTH_ROUTES.signIn);
  }, [logoutMutation, queryClient, router, setError, setUser]);

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading:
      sessionQuery.isLoading ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
