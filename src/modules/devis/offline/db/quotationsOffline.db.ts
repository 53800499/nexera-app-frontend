import Dexie, { type EntityTable } from "dexie";
import type {
  OfflineMetaRecord,
  OfflineQuotationRecord,
  QuotationSyncQueueRecord,
} from "../types/offline.types";

class QuotationsOfflineDatabase extends Dexie {
  quotations!: EntityTable<OfflineQuotationRecord, "id">;
  syncQueue!: EntityTable<QuotationSyncQueueRecord, "id">;
  meta!: EntityTable<OfflineMetaRecord, "key">;

  constructor() {
    super("nexera-quotations-offline");
    this.version(1).stores({
      quotations: "id, serverId, tenantId, syncStatus, updatedAt",
      syncQueue: "++id, operation, entityId, createdAt",
      meta: "key",
    });
  }
}

let quotationsDb: QuotationsOfflineDatabase | null = null;

export function getQuotationsOfflineDb(): QuotationsOfflineDatabase | null {
  if (typeof window === "undefined") return null;
  if (!quotationsDb) quotationsDb = new QuotationsOfflineDatabase();
  return quotationsDb;
}

export async function clearQuotationsOfflineDb() {
  const db = getQuotationsOfflineDb();
  if (!db) return;
  await db.transaction("rw", db.quotations, db.syncQueue, db.meta, async () => {
    await db.quotations.clear();
    await db.syncQueue.clear();
    await db.meta.clear();
  });
}
