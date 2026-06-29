export const CABINET_ROUTES = {
  cockpit: "/cabinet",
  dossiers: "/cabinet/dossiers",
  dossier: (companyTenantId: string) =>
    `/cabinet/dossiers/${companyTenantId}`,
} as const;

export const CABINET_QUERY_KEYS = {
  linkedCompanies: ["cabinet", "companies"] as const,
  companyInvoices: (companyTenantId: string, page: number, limit: number) =>
    ["cabinet", "companies", companyTenantId, "invoices", page, limit] as const,
};
