import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { clearCrmOfflineIfOnline, setCrmOfflineMode } from "../utils/crmOfflineState";
import { withTimeout } from "@/shared/lib/withTimeout";
import { clientsApi } from "../../services/clientsApi.service";
import type {
  CheckDuplicatesResult,
  ClientDetail,
  CreateClientPayload,
  CreateContactPayload,
  PaginatedClients,
  UpdateClientPayload,
} from "../../types/client.types";
import type { Contact } from "../../types/client.types";
import { crmOfflineRepository } from "./crmOfflineRepository";
import { crmSyncQueue } from "./crmSyncQueue.service";
import { createLocalId } from "../types/offline.types";
import { useCrmSyncStore } from "../store/crmSyncStore";
import { parseAddress } from "../../schemas/clientForm.schema";

const API_READ_TIMEOUT_MS = 8_000;

function isOfflineMode() {
  if (typeof window === "undefined") return false;
  if (!isBrowserOnline()) return true;
  return useCrmSyncStore.getState().isOffline;
}

function setCrmOffline(offline: boolean) {
  setCrmOfflineMode(offline);
}

function buildOptimisticClient(
  payload: CreateClientPayload,
  localId: string,
): ClientDetail {
  const primaryContact: Contact = {
    id: createLocalId(),
    firstName: payload.primaryContact.firstName,
    lastName: payload.primaryContact.lastName,
    jobTitle: payload.primaryContact.jobTitle ?? null,
    email: payload.primaryContact.email ?? null,
    phone: payload.primaryContact.phone ?? null,
    isPrimary: true,
  };

  return {
    id: localId,
    tenantId: "local",
    code: "LOCAL",
    clientType: payload.clientType,
    companyName: payload.companyName,
    tradeName: payload.tradeName ?? null,
    siret: payload.siret ?? null,
    taxId: payload.taxId ?? null,
    sector: payload.sector ?? null,
    isArchived: false,
    defaultCurrency: payload.defaultCurrency ?? DEFAULT_CURRENCY,
    billingAddress: parseAddress(JSON.parse(payload.billingAddress)),
    shippingAddress: payload.shippingAddress
      ? parseAddress(JSON.parse(payload.shippingAddress))
      : null,
    defaultDiscountPct: payload.defaultDiscountPct ?? 0,
    creditLimit: payload.creditLimit ?? null,
    notes: payload.notes ?? null,
    remindersDisabled: payload.remindersDisabled ?? false,
    remindersDisabledReason: payload.remindersDisabledReason ?? null,
    contacts: [primaryContact],
    _count: {
      contacts: 1,
      quotations: 0,
      invoices: 0,
      orders: 0,
      payments: 0,
    },
  };
}

async function cachePaginatedClients(data: PaginatedClients) {
  await Promise.all(
    data.items.map((item) =>
      crmOfflineRepository.upsertClient(
        { ...item, contacts: item.contacts ?? [] },
        "synced",
      ),
    ),
  );
}

async function readWithOfflineFallback<T>(
  onlineReader: () => Promise<T>,
  offlineReader: () => Promise<T>,
): Promise<T> {
  const offlineData = await offlineReader();

  if (isOfflineMode()) {
    return offlineData;
  }

  try {
    const data = await withTimeout(onlineReader(), API_READ_TIMEOUT_MS);
    if (isBrowserOnline()) {
      clearCrmOfflineIfOnline();
    }
    return data;
  } catch {
    if (!isBrowserOnline()) {
      setCrmOffline(true);
    }
    return offlineData;
  }
}

export const clientsOfflineService = {
  isOnline: () => !isOfflineMode(),

  async list(params: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedClients> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    return readWithOfflineFallback(
      async () => {
        const data = await clientsApi.list(params);
        await cachePaginatedClients(data);
        return data;
      },
      () => crmOfflineRepository.paginateClients(page, limit),  
    );
  },

  async search(q: string): Promise<PaginatedClients> {
    return readWithOfflineFallback(
      async () => {
        const data = await clientsApi.search(q);
        await cachePaginatedClients(data);
        return data;
      },
      async () => {
        const items = await crmOfflineRepository.searchClients(q);
        return {
          items,
          total: items.length,
          page: 1,
          limit: items.length || 20,
          totalPages: 1,
        };
      },
    );
  },

  async byId(id: string): Promise<ClientDetail> {
    return readWithOfflineFallback(
      async () => {
        const client = await clientsApi.byId(id);
        await crmOfflineRepository.upsertClient(client, "synced");
        return client;
      },
      async () => {
        const cached = await crmOfflineRepository.getClient(id);
        if (!cached) throw new Error("Client introuvable hors-ligne");
        return cached;
      },
    );
  },

  async checkDuplicates(payload: {
    siret?: string;
    taxId?: string;
    email?: string;
    companyName?: string;
  }): Promise<CheckDuplicatesResult> {
    if (isOfflineMode()) {
      const local = await crmOfflineRepository.searchClients(
        payload.companyName ?? payload.siret ?? payload.taxId ?? "",
      );
      return {
        hasDuplicates: local.length > 0,
        duplicates: local.slice(0, 5).map((client) => ({
          id: client.id,
          code: client.code,
          companyName: client.companyName,
          siret: client.siret,
          taxId: client.taxId,
          matchedOn: ["cache_locale"],
        })),
      };
    }
    return clientsApi.checkDuplicates(payload);
  },

  async create(payload: CreateClientPayload): Promise<ClientDetail> {
    if (!isOfflineMode()) {
      const client = await clientsApi.create(payload);
      await crmOfflineRepository.upsertClient(client, "synced");
      return client;
    }

    const localId = createLocalId();
    const optimistic = buildOptimisticClient(payload, localId);
    await crmOfflineRepository.upsertClient(optimistic, "pending");
    await crmSyncQueue.enqueue({
      operation: "createClient",
      entityId: localId,
      payload: crmSyncQueue.payload(payload),
    });
    return optimistic;
  },

  async update(id: string, payload: UpdateClientPayload): Promise<ClientDetail> {
    if (!isOfflineMode()) {
      const client = await clientsApi.update(id, payload);
      await crmOfflineRepository.upsertClient(client, "synced");
      return client;
    }

    const existing = await crmOfflineRepository.getClient(id);
    if (!existing) throw new Error("Client introuvable hors-ligne");

    const updated: ClientDetail = {
      ...existing,
      ...payload,
      billingAddress: payload.billingAddress
        ? parseAddress(JSON.parse(payload.billingAddress))
        : existing.billingAddress,
      shippingAddress:
        payload.shippingAddress !== undefined
          ? payload.shippingAddress
            ? parseAddress(JSON.parse(payload.shippingAddress))
            : null
          : existing.shippingAddress,
    };

    await crmOfflineRepository.upsertClient(updated, "pending");
    await crmSyncQueue.enqueue({
      operation: "updateClient",
      entityId: id,
      payload: crmSyncQueue.payload(payload),
    });
    return updated;
  },

  async archive(id: string) {
    if (!isOfflineMode()) {
      const result = await clientsApi.archive(id);
      const client = await crmOfflineRepository.getClient(id);
      if (client) {
        await crmOfflineRepository.upsertClient(
          { ...client, isArchived: true },
          "synced",
        );
      }
      return result;
    }

    await crmOfflineRepository.markClientDeleted(id);
    await crmSyncQueue.enqueue({
      operation: "archiveClient",
      entityId: id,
      payload: crmSyncQueue.payload({}),
    });
    return { message: "Archivage en attente de synchronisation", archived: true };
  },

  async addContact(clientId: string, payload: CreateContactPayload) {
    if (!isOfflineMode()) {
      const contact = await clientsApi.addContact(clientId, payload);
      const client = await crmOfflineRepository.getClient(clientId);
      if (client) {
        await crmOfflineRepository.upsertClient(
          { ...client, contacts: [...(client.contacts ?? []), contact] },
          "synced",
        );
      }
      return contact;
    }

    const client = await crmOfflineRepository.getClient(clientId);
    if (!client) throw new Error("Client introuvable hors-ligne");

    const contact: Contact = {
      id: createLocalId(),
      firstName: payload.firstName,
      lastName: payload.lastName,
      jobTitle: payload.jobTitle ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      isPrimary: payload.isPrimary ?? false,
    };

    await crmOfflineRepository.upsertClient(
      { ...client, contacts: [...(client.contacts ?? []), contact] },
      "pending",
    );
    await crmSyncQueue.enqueue({
      operation: "addContact",
      entityId: contact.id,
      parentId: clientId,
      payload: crmSyncQueue.payload(payload),
    });
    return contact;
  },

  async updateContact(
    contactId: string,
    clientId: string,
    payload: Partial<CreateContactPayload>,
  ) {
    if (!isOfflineMode()) {
      const contact = await clientsApi.updateContact(contactId, payload);
      const client = await crmOfflineRepository.getClient(clientId);
      if (client) {
        await crmOfflineRepository.upsertClient(
          {
            ...client,
            contacts: (client.contacts ?? []).map((c) =>
              c.id === contactId ? contact : c,
            ),
          },
          "synced",
        );
      }
      return contact;
    }

    const client = await crmOfflineRepository.getClient(clientId);
    if (!client) throw new Error("Client introuvable hors-ligne");

    const contacts = (client.contacts ?? []).map((contact) =>
      contact.id === contactId ? { ...contact, ...payload } : contact,
    );

    await crmOfflineRepository.upsertClient(
      { ...client, contacts },
      "pending",
    );
    await crmSyncQueue.enqueue({
      operation: "updateContact",
      entityId: contactId,
      parentId: clientId,
      payload: crmSyncQueue.payload(payload),
    });

    return contacts.find((c) => c.id === contactId)!;
  },

  async removeContact(contactId: string, clientId: string) {
    if (!isOfflineMode()) {
      const result = await clientsApi.removeContact(contactId);
      const client = await crmOfflineRepository.getClient(clientId);
      if (client) {
        await crmOfflineRepository.upsertClient(
          {
            ...client,
            contacts: (client.contacts ?? []).filter((c) => c.id !== contactId),
          },
          "synced",
        );
      }
      return result;
    }

    const client = await crmOfflineRepository.getClient(clientId);
    if (!client) throw new Error("Client introuvable hors-ligne");

    await crmOfflineRepository.upsertClient(
      {
        ...client,
        contacts: (client.contacts ?? []).filter((c) => c.id !== contactId),
      },
      "pending",
    );
    await crmSyncQueue.enqueue({
      operation: "removeContact",
      entityId: contactId,
      parentId: clientId,
      payload: crmSyncQueue.payload({}),
    });
    return { message: "Suppression en attente de synchronisation" };
  },
};
