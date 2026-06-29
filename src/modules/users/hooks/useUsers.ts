"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { usersApi } from "../services/usersApi.service";
import type { CreateUserPayload, UpdateUserPayload } from "../types/user.types";

export const USERS_QUERY_KEY = ["users"] as const;
export const USER_ROLES_QUERY_KEY = ["user-roles"] as const;

export function userQueryKey(id: string) {
  return ["users", id] as const;
}

export function userPermissionsQueryKey(id: string) {
  return ["users", id, "permissions"] as const;
}

export function useUsers() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const usersQuery = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: usersApi.list,
    enabled: queryEnabled,
  });

  const rolesQuery = useQuery({
    queryKey: USER_ROLES_QUERY_KEY,
    queryFn: usersApi.listRoles,
    enabled: queryEnabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: userQueryKey(variables.id) });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.toggleStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: userQueryKey(variables.id) });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: userQueryKey(id) });
    },
  });

  const syncRolesMutation = useMutation({
    mutationFn: ({
      userId,
      currentRoleIds,
      nextRoleIds,
    }: {
      userId: string;
      currentRoleIds: string[];
      nextRoleIds: string[];
    }) => usersApi.syncRoles(userId, currentRoleIds, nextRoleIds),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: userQueryKey(user.id) });
      queryClient.invalidateQueries({
        queryKey: userPermissionsQueryKey(user.id),
      });
    },
  });

  return {
    usersQuery,
    rolesQuery,
    createMutation,
    updateMutation,
    toggleStatusMutation,
    removeMutation,
    syncRolesMutation,
  };
}

export function useUser(id: string) {
  const queryEnabled = useQueryEnabled(Boolean(id));

  return useQuery({
    queryKey: userQueryKey(id),
    queryFn: () => usersApi.byId(id),
    enabled: queryEnabled,
  });
}

export function useUserPermissions(id: string, enabled = true) {
  const queryEnabled = useQueryEnabled(Boolean(id) && enabled);

  return useQuery({
    queryKey: userPermissionsQueryKey(id),
    queryFn: () => usersApi.permissions(id),
    enabled: queryEnabled,
  });
}
