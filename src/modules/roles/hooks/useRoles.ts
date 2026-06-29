"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { rolesApi } from "../services/rolesApi.service";
import type { CreateRolePayload, UpdateRolePayload } from "../types/role.types";

export const ROLES_QUERY_KEY = ["roles"] as const;

export function useRoles() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const rolesQuery = useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: rolesApi.list,
    enabled: queryEnabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      rolesApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });

  const togglePermissionMutation = useMutation({
    mutationFn: ({
      roleId,
      permissionId,
      enabled,
    }: {
      roleId: string;
      permissionId: string;
      enabled: boolean;
    }) =>
      enabled
        ? rolesApi.addPermission(roleId, permissionId)
        : rolesApi.removePermission(roleId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.roleId] });
    },
  });

  return {
    rolesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    togglePermissionMutation,
  };
}

export function useRole(id: string) {
  const queryEnabled = useQueryEnabled(Boolean(id));

  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => rolesApi.byId(id),
    enabled: queryEnabled,
  });
}
