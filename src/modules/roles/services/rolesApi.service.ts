import { apiClient } from "@/shared/http/apiClient";
import type {
  CreateRolePayload,
  Role,
  UpdateRolePayload,
} from "../types/role.types";

export const rolesApi = {
  list: () => apiClient<Role[]>("/roles", { auth: true }),
  byId: (id: string) => apiClient<Role>(`/roles/${id}`, { auth: true }),
  create: (payload: CreateRolePayload) =>
    apiClient<Role>("/roles", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  update: (id: string, payload: UpdateRolePayload) =>
    apiClient<Role>(`/roles/${id}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
  remove: (id: string) =>
    apiClient<{ message: string }>(`/roles/${id}`, {
      method: "DELETE",
      auth: true,
    }),
  addPermission: (roleId: string, permissionId: string) =>
    apiClient<Role>(`/roles/${roleId}/permissions/${permissionId}`, {
      method: "POST",
      auth: true,
    }),
  removePermission: (roleId: string, permissionId: string) =>
    apiClient<Role>(`/roles/${roleId}/permissions/${permissionId}`, {
      method: "DELETE",
      auth: true,
    }),
};
