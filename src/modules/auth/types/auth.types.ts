import type { UserRole, WorkspaceType } from "./user.types";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type TenantType = "company" | "cabinet";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  tenantType: TenantType;
  role: UserRole;
  roles: string[];
  permissions: string[];
  workspace: WorkspaceType;
};

export type AuthSession = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterDirigeantData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantName: string;
  tenantType?: TenantType;
};

export type AuthApiResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    tenantType: TenantType;
    roles: string[];
    permissions: string[];
  };
};

export type AuthAuditAction = "login" | "register" | "logout";

export type AuthAuditLog = {
  id?: number;
  action: AuthAuditAction;
  email?: string;
  status: "success" | "error";
  message?: string;
  createdAt: number;
};
