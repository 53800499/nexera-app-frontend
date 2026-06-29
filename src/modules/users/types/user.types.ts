export type RoleSummary = {
  id: string;
  code: string;
  name: string;
};

export type UserTenant = {
  id: string;
  name: string;
  type?: string;
};

export type UserRoleLink = {
  role: RoleSummary;
};

export type UserSummary = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  roles: UserRoleLink[];
  tenant?: UserTenant;
};

export type UserPermissionsResponse = {
  userId: string;
  tenantId: string;
  permissions: string[];
  roles: string[];
};

export type CreateUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  isActive?: boolean;
  requestPasswordReset?: boolean;
  roleIds?: string[];
};

export type UpdateUserPayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
  requestPasswordReset?: boolean;
};

export type AssignRolesPayload = {
  roleIds: string[];
};
