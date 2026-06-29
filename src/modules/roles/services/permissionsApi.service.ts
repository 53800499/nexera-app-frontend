import { apiClient } from "@/shared/http/apiClient";
import type { Permission } from "../types/role.types";

export const permissionsApi = {
  list: () => apiClient<Permission[]>("/permissions", { auth: true }),
};
