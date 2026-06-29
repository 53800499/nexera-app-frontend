import Dexie, { type EntityTable } from "dexie";
import type {
  OfflineClientRecord,
  OfflineMetaRecord,
  SyncQueueRecord,
} from "../types/offline.types";

class CrmOfflineDatabase extends Dexie {
  clients!: EntityTable<OfflineClientRecord, "id">;
  syncQueue!: EntityTable<SyncQueueRecord, "id">;
  meta!: EntityTable<OfflineMetaRecord, "key">;

  constructor() {
    super("nexera-crm-offline");
    this.version(1).stores({
      clients: "id, serverId, tenantId, syncStatus, updatedAt",
      syncQueue: "++id, operation, entityId, parentId, createdAt",
      meta: "key",
    });
  }
}

let crmDb: CrmOfflineDatabase | null = null;

export function getCrmOfflineDb(): CrmOfflineDatabase | null {
  if (typeof window === "undefined") return null;
  if (!crmDb) crmDb = new CrmOfflineDatabase();
  return crmDb;
}

export async function clearCrmOfflineDb() {
  const db = getCrmOfflineDb();
  if (!db) return;
  await db.transaction("rw", db.clients, db.syncQueue, db.meta, async () => {
    await db.clients.clear();
    await db.syncQueue.clear();
    await db.meta.clear();
  });
}
