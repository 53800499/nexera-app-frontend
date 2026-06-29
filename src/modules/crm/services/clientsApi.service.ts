import { env } from "@/shared/config/env";
import { AppError, AUTH_ERRORS } from "@/shared/core/AppError";
import { OfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { fetchWithOfflineGuard } from "@/shared/http/fetchWithOfflineGuard";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";
import type {
  CheckDuplicatesResult,
  ClientDetail,
  CreateClientPayload,
  CreateContactPayload,
  DuplicateMatch,
  PaginatedClients,
  UpdateClientPayload,
} from "../types/client.types";
import { ClientDuplicateError as DuplicateErrorClass } from "../types/client.types";
import type { Contact } from "../types/client.types";

type ListParams = {
  page?: number;
  limit?: number;
  q?: string;
};

async function authorizedFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!isBrowserOnline()) {
    throw new OfflineError();
  }

  const token = tokenStorage.getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchWithOfflineGuard(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?:
        | string
        | {
            code?: string;
            message?: string;
            duplicates?: DuplicateMatch[];
          };
      code?: string;
      duplicates?: DuplicateMatch[];
    };

    const nested: {
      code?: string;
      message?: string;
      duplicates?: DuplicateMatch[];
    } =
      typeof body.message === "object" && body.message !== null
        ? body.message
        : { code: body.code, message: typeof body.message === "string" ? body.message : undefined, duplicates: body.duplicates };

    if (
      response.status === 409 &&
      nested.code === "DUPLICATE_CLIENT" &&
      nested.duplicates
    ) {
      throw new DuplicateErrorClass(nested.duplicates);
    }

    const message =
      typeof nested.message === "string"
        ? nested.message
        : typeof body.message === "string"
          ? body.message
          : "Une erreur est survenue";

    throw new AppError(
      message,
      nested.code ?? body.code ?? AUTH_ERRORS.UNAUTHORIZED,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const clientsApi = {
  list: (params: ListParams = {}) => {
    const search = new URLSearchParams();
    if (params.page) search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    if (params.q) search.set("q", params.q);
    const query = search.toString();
    return authorizedFetch<PaginatedClients>(
      `/clients${query ? `?${query}` : ""}`,
    );
  },

  search: (q: string) =>
    authorizedFetch<PaginatedClients>(
      `/clients/search?q=${encodeURIComponent(q)}`,
    ),

  byId: (id: string) => authorizedFetch<ClientDetail>(`/clients/${id}`),

  checkDuplicates: (payload: {
    siret?: string;
    taxId?: string;
    email?: string;
    companyName?: string;
  }) =>
    authorizedFetch<CheckDuplicatesResult>("/clients/check-duplicates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  create: (payload: CreateClientPayload) =>
    authorizedFetch<ClientDetail>("/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateClientPayload) =>
    authorizedFetch<ClientDetail>(`/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  archive: (id: string) =>
    authorizedFetch<{ message: string; archived: boolean }>(`/clients/${id}`, {
      method: "DELETE",
    }),

  addContact: (clientId: string, payload: CreateContactPayload) =>
    authorizedFetch<Contact>(`/clients/${clientId}/contacts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateContact: (contactId: string, payload: Partial<CreateContactPayload>) =>
    authorizedFetch<Contact>(`/clients/contacts/${contactId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  removeContact: (contactId: string) =>
    authorizedFetch<{ message: string }>(`/clients/contacts/${contactId}`, {
      method: "DELETE",
    }),
};
