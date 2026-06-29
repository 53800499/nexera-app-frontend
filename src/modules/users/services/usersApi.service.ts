import { apiClient } from "@/shared/http/apiClient";
import type {
  AssignRolesPayload,
  CreateUserPayload,
  RoleSummary,
  UpdateUserPayload,
  UserPermissionsResponse,
  UserSummary,
} from "../types/user.types";

export const usersApi = {
  list: () => apiClient<UserSummary[]>("/users", { auth: true }),

  byId: (id: string) => apiClient<UserSummary>(`/users/${id}`, { auth: true }),

  permissions: (id: string) =>
    apiClient<UserPermissionsResponse>(`/users/${id}/permissions`, {
      auth: true,
    }),

  create: (payload: CreateUserPayload) =>
    apiClient<UserSummary>("/users", {
      method: "POST",
      body: payload,
      auth: true,
    }),

  update: (id: string, payload: UpdateUserPayload) =>
    apiClient<UserSummary>(`/users/${id}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),

  toggleStatus: (id: string, isActive: boolean) =>
    apiClient<UserSummary>(`/users/${id}/status`, {
      method: "PATCH",
      body: { isActive },
      auth: true,
    }),

  remove: (id: string) =>
    apiClient<{ message: string; userId: string }>(`/users/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  assignRoles: (id: string, payload: AssignRolesPayload) =>
    apiClient<UserSummary>(`/users/${id}/roles`, {
      method: "POST",
      body: payload,
      auth: true,
    }),

  removeRole: (id: string, roleId: string) =>
    apiClient<UserSummary>(`/users/${id}/roles/${roleId}`, {
      method: "DELETE",
      auth: true,
    }),

  listRoles: () => apiClient<RoleSummary[]>("/roles", { auth: true }),

  async syncRoles(userId: string, currentRoleIds: string[], nextRoleIds: string[]) {
    const current = new Set(currentRoleIds);
    const next = new Set(nextRoleIds);

    const toAdd = nextRoleIds.filter((id) => !current.has(id));
    const toRemove = currentRoleIds.filter((id) => !next.has(id));

    if (toAdd.length > 0) {
      await usersApi.assignRoles(userId, { roleIds: toAdd });
    }

    for (const roleId of toRemove) {
      await usersApi.removeRole(userId, roleId);
    }

    return usersApi.byId(userId);
  },
};
