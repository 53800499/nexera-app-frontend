import { clientsApi } from "../../services/clientsApi.service";
import type {
  CreateClientPayload,
  CreateContactPayload,
  UpdateClientPayload,
} from "../../types/client.types";
import { ClientDuplicateError } from "../../types/client.types";
import { crmOfflineRepository } from "./crmOfflineRepository";
import { crmSyncQueue } from "./crmSyncQueue.service";
import { isLocalId } from "../types/offline.types";

let syncing = false;

async function resolveClientId(clientId: string) {
  if (!isLocalId(clientId)) return clientId;

  const client = await crmOfflineRepository.getClient(clientId);
  if (client && !isLocalId(client.id)) return client.id;

  const db = await import("../db/crmOffline.db").then((m) => m.getCrmOfflineDb());
  const record = await db?.clients.get(clientId);
  if (record?.serverId) return record.serverId;

  throw new Error("Le client local n'est pas encore synchronisé.");
}

export const crmSyncEngine = {
  async sync(): Promise<{ processed: number; failed: number }> {
    if (syncing || typeof navigator === "undefined" || !navigator.onLine) {
      return { processed: 0, failed: 0 };
    }

    syncing = true;
    let processed = 0;
    let failed = 0;

    try {
      const queue = await crmSyncQueue.peekAll();

      for (const item of queue) {
        if (item.id == null) continue;

        try {
          await processQueueItem(item);
          await crmSyncQueue.remove(item.id);
          processed += 1;
        } catch (error) {
          failed += 1;
          const message =
            error instanceof Error ? error.message : "Erreur de synchronisation";
          await crmSyncQueue.markError(item.id, message);

          if (error instanceof ClientDuplicateError) {
            break;
          }
        }
      }

      if (processed > 0) {
        await pullLatestClients();
      }

      await crmOfflineRepository.setMeta(
        "lastSyncAt",
        new Date().toISOString(),
      );
    } finally {
      syncing = false;
    }

    return { processed, failed };
  },

  get isSyncing() {
    return syncing;
  },
};

async function processQueueItem(
  item: Awaited<ReturnType<typeof crmSyncQueue.peekAll>>[number],
) {
  switch (item.operation) {
    case "createClient": {
      const payload = crmSyncQueue.parsePayload<CreateClientPayload>(
        item.payload,
      );
      const created = await clientsApi.create(payload);
      await crmOfflineRepository.replaceLocalClient(item.entityId, created);
      return;
    }
    case "updateClient": {
      const clientId = await resolveClientId(item.entityId);
      const payload = crmSyncQueue.parsePayload<UpdateClientPayload>(
        item.payload,
      );
      const updated = await clientsApi.update(clientId, payload);
      await crmOfflineRepository.upsertClient(updated, "synced");
      return;
    }
    case "archiveClient": {
      const clientId = await resolveClientId(item.entityId);
      await clientsApi.archive(clientId);
      const client = await crmOfflineRepository.getClient(clientId);
      if (client) {
        await crmOfflineRepository.upsertClient(
          { ...client, isArchived: true },
          "synced",
        );
      }
      return;
    }
    case "addContact": {
      const clientId = await resolveClientId(item.parentId ?? item.entityId);
      const payload = crmSyncQueue.parsePayload<CreateContactPayload>(
        item.payload,
      );
      const contact = await clientsApi.addContact(clientId, payload);
      const client = await crmOfflineRepository.getClient(clientId);
      if (client) {
        await crmOfflineRepository.upsertClient(
          {
            ...client,
            contacts: [...(client.contacts ?? []), contact],
          },
          client.id.startsWith("local_") ? "pending" : "synced",
        );
      }
      return;
    }
    case "updateContact": {
      const payload = crmSyncQueue.parsePayload<Partial<CreateContactPayload>>(
        item.payload,
      );
      const contact = await clientsApi.updateContact(item.entityId, payload);
      const clientId = item.parentId
        ? await resolveClientId(item.parentId)
        : undefined;
      if (clientId) {
        const client = await crmOfflineRepository.getClient(clientId);
        if (client) {
          await crmOfflineRepository.upsertClient(
            {
              ...client,
              contacts: (client.contacts ?? []).map((c) =>
                c.id === contact.id ? contact : c,
              ),
            },
            "synced",
          );
        }
      }
      return;
    }
    case "removeContact": {
      await clientsApi.removeContact(item.entityId);
      const clientId = item.parentId
        ? await resolveClientId(item.parentId)
        : undefined;
      if (clientId) {
        const client = await crmOfflineRepository.getClient(clientId);
        if (client) {
          await crmOfflineRepository.upsertClient(
            {
              ...client,
              contacts: (client.contacts ?? []).filter(
                (c) => c.id !== item.entityId,
              ),
            },
            "synced",
          );
        }
      }
      return;
    }
    default:
      throw new Error(`Opération inconnue : ${item.operation}`);
  }
}

async function pullLatestClients() {
  const page1 = await clientsApi.list({ page: 1, limit: 100 });
  await Promise.all(
    page1.items.map((summary) =>
      crmOfflineRepository.upsertClient(
        {
          ...summary,
          contacts: summary.contacts ?? [],
        },
        "synced",
      ),
    ),
  );
}
