import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  AuthorizedCabinet,
  CabinetInviteCodeResponse,
  GrantCabinetAccessPayload,
  UpdateCabinetPermissionsPayload,
  LinkedCompany,
  PaginatedCabinetInvoices,
} from "../types/cabinet.types";

export const cabinetApi = {
  getInviteCode: () =>
    authorizedFetch<CabinetInviteCodeResponse>("/cabinet/invite-code"),

  regenerateInviteCode: () =>
    authorizedFetch<CabinetInviteCodeResponse>("/cabinet/invite-code/regenerate", {
      method: "POST",
    }),

  listAuthorizedCabinets: () =>
    authorizedFetch<AuthorizedCabinet[]>("/cabinet/access"),

  grantCabinetAccess: (payload: GrantCabinetAccessPayload) =>
    authorizedFetch<{ message: string }>("/cabinet/access", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCabinetPermissions: (
    cabinetTenantId: string,
    payload: UpdateCabinetPermissionsPayload,
  ) =>
    authorizedFetch<{ message: string }>(
      `/cabinet/access/${cabinetTenantId}/permissions`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  revokeCabinetAccess: (cabinetTenantId: string) =>
    authorizedFetch<{ message: string }>("/cabinet/access", {
      method: "DELETE",
      body: JSON.stringify({ cabinetTenantId }),
    }),

  listLinkedCompanies: () =>
    authorizedFetch<LinkedCompany[]>("/cabinet/companies"),

  listCompanyInvoices: (
    companyTenantId: string,
    params: { page?: number; limit?: number } = {},
  ) => {
    const search = new URLSearchParams();
    if (params.page) search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    const query = search.toString();
    return authorizedFetch<PaginatedCabinetInvoices>(
      `/cabinet/companies/${companyTenantId}/invoices${query ? `?${query}` : ""}`,
    );
  },
};
