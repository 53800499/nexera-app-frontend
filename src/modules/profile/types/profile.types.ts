export type CabinetProfileInfo = {
  id: string;
  raisonSociale: string;
  numeroInscriptionOrdre?: string | null;
  paysCode: string;
  adresse?: string | null;
  telephone?: string | null;
  emailContact?: string | null;
};

export type CollaborateurProfileInfo = {
  id: string;
  nomPrenoms: string;
  statut: string;
  numeroOrdreProfessionnel?: string | null;
  role?: { code: string; libelle: string } | null;
};

export type ProfileTenant = {
  id: string;
  name: string;
  type: string;
  legalName?: string | null;
  tradeName?: string | null;
  primaryCurrency: string;
  companyEmail?: string | null;
  cabinet?: CabinetProfileInfo | null;
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
  cabinet?: CabinetProfileInfo | null;
  collaborateur?: CollaborateurProfileInfo | null;
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
