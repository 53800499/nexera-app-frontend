export const USER_ROLES = {
  DIRIGEANT: "dirigeant",
  RESPONSABLE_COMMERCIAL: "responsable_commercial",
  COMMERCIAL: "commercial",
  COMPTABLE: "comptable",
  EXPERT_COMPTABLE: "expert_comptable",
  COLLABORATEUR_CABINET: "collaborateur_cabinet",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const WORKSPACE_TYPES = {
  CABINET: "cabinet",
  ENTREPRISE: "entreprise",
} as const;

export type WorkspaceType =
  (typeof WORKSPACE_TYPES)[keyof typeof WORKSPACE_TYPES];

export const PERMISSION_LEVELS = {
  READ: "read",
  WRITE: "write",
  PARTIAL_WRITE: "partial_write",
} as const;

export type PermissionLevel =
  (typeof PERMISSION_LEVELS)[keyof typeof PERMISSION_LEVELS];

export type ModulePermission = {
  module: string;
  level: PermissionLevel;
};

export function getUserDisplayName(user: {
  firstName: string;
  lastName: string;
}): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
