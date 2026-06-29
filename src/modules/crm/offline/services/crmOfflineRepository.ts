import type {
  ClientDetail,
  ClientSummary,
  PaginatedClients,
} from "../../types/client.types";
import { getCrmOfflineDb } from "../db/crmOffline.db";
import type { OfflineClientRecord, SyncStatus } from "../types/offline.types";

function parseClient(record: OfflineClientRecord): ClientDetail {
  if (typeof record.data === "string") {
    return JSON.parse(record.data) as ClientDetail;
  }
  return record.data as ClientDetail;
}

function toSummary(client: ClientDetail): ClientSummary {
  const { contacts, _count, ...summary } = client;
  return {
    ...summary,
    contacts: contacts ?? [],
    _count,
  };
}

export const crmOfflineRepository = {
  async upsertClient(
    client: ClientDetail,
    syncStatus: SyncStatus,
    serverId?: string,
  ) {
    const db = getCrmOfflineDb();
    if (!db) return;

    const record: OfflineClientRecord = {
      id: client.id,
      serverId: serverId ?? (client.id.startsWith("local_") ? undefined : client.id),
      tenantId: client.tenantId,
      data: JSON.stringify(client),
      syncStatus,
      updatedAt: new Date().toISOString(),
      isDeleted: client.isArchived,
    };

    await db.clients.put(record);
  },

  async replaceLocalClient(localId: string, serverClient: ClientDetail) {
    const db = getCrmOfflineDb();
    if (!db) return;

    await db.transaction("rw", db.clients, db.syncQueue, async () => {
      await db.clients.delete(localId);

      await db.clients.put({
        id: serverClient.id,
        serverId: serverClient.id,
        tenantId: serverClient.tenantId,
        data: JSON.stringify(serverClient),
        syncStatus: "synced",
        updatedAt: new Date().toISOString(),
        isDeleted: serverClient.isArchived,
      });

      const queueItems = await db.syncQueue.toArray();
      for (const item of queueItems) {
        let changed = false;
        let entityId = item.entityId;
        let parentId = item.parentId;

        if (item.entityId === localId) {
          entityId = serverClient.id;
          changed = true;
        }
        if (item.parentId === localId) {
          parentId = serverClient.id;
          changed = true;
        }

        if (changed && item.id != null) {
          await db.syncQueue.update(item.id, { entityId, parentId });
        }
      }
    });
  },

  async getClient(id: string): Promise<ClientDetail | null> {
    const db = getCrmOfflineDb();
    if (!db) return null;

    const byId = await db.clients.get(id);
    if (byId && !byId.isDeleted) return parseClient(byId);

    const byServerId = await db.clients
      .where("serverId")
      .equals(id)
      .first();
    if (byServerId && !byServerId.isDeleted) return parseClient(byServerId);

    return null;
  },

  async listClients(): Promise<ClientSummary[]> {
    const db = getCrmOfflineDb();
    if (!db) return [];

    const records = await db.clients
      .filter((record) => record.isDeleted !== true)
      .toArray();

    return records
      .map((record) => {
        try {
          return toSummary(parseClient(record));
        } catch {
          return null;
        }
      })
      .filter((client): client is ClientSummary => client !== null)
      .sort((a, b) =>
        (a.companyName ?? "").localeCompare(b.companyName ?? "", "fr"),
      );
  },

  async searchClients(query: string): Promise<ClientSummary[]> {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const all = await this.listClients();
    return all.filter((client) => {
      const haystack = [
        client.companyName,
        client.code,
        client.siret ?? "",
        client.taxId ?? "",
        client.tradeName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  },

  async paginateClients(
    page: number,
    limit: number,
  ): Promise<PaginatedClients> {
    const items = await this.listClients();
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * limit;

    return {
      items: items.slice(start, start + limit),
      total,
      page: safePage,
      limit,
      totalPages,
    };
  },

  async markClientDeleted(id: string) {
    const db = getCrmOfflineDb();
    if (!db) return;

    const record = await db.clients.get(id);
    if (!record) return;

    await db.clients.update(id, {
      isDeleted: true,
      syncStatus: "pending",
      updatedAt: new Date().toISOString(),
    });
  },

  async setMeta(key: string, value: string) {
    const db = getCrmOfflineDb();
    if (!db) return;
    await db.meta.put({ key, value });
  },

  async getMeta(key: string) {
    const db = getCrmOfflineDb();
    if (!db) return null;
    const row = await db.meta.get(key);
    return row?.value ?? null;
  },

  async getPendingCount() {
    const db = getCrmOfflineDb();
    if (!db) return 0;
    return db.syncQueue.count();
  },
};
