export type Permission = {
  id: string;
  code: string;
  description: string | null;
  createdAt?: string;
};

export type RolePermissionLink = {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
};

export type Role = {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  permissions: RolePermissionLink[];
};

export type RoleSummary = Pick<Role, "id" | "code" | "name">;

export type CreateRolePayload = {
  name: string;
  code: string;
  description?: string;
  tenantId: string;
  permissionIds?: string[];
};

export type UpdateRolePayload = Partial<CreateRolePayload>;
