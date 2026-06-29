export type ProfileTenant = {
  id: string;
  name: string;
  type: string;
  legalName?: string | null;
  tradeName?: string | null;
  primaryCurrency: string;
  companyEmail?: string | null;
};

export type ProfileResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenant: ProfileTenant;
  tenantId: string;
  tenantName: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfilePayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
