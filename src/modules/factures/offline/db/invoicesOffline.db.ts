import Dexie, { type EntityTable } from "dexie";
import type {
  InvoiceSyncQueueRecord,
  OfflineInvoiceRecord,
  OfflineMetaRecord,
} from "../types/offline.types";

class InvoicesOfflineDatabase extends Dexie {
  invoices!: EntityTable<OfflineInvoiceRecord, "id">;
  syncQueue!: EntityTable<InvoiceSyncQueueRecord, "id">;
  meta!: EntityTable<OfflineMetaRecord, "key">;

  constructor() {
    super("nexera-invoices-offline");
    this.version(1).stores({
      invoices: "id, serverId, tenantId, syncStatus, updatedAt",
      syncQueue: "++id, operation, entityId, createdAt",
      meta: "key",
    });
  }
}

let invoicesDb: InvoicesOfflineDatabase | null = null;

export function getInvoicesOfflineDb(): InvoicesOfflineDatabase | null {
  if (typeof window === "undefined") return null;
  if (!invoicesDb) invoicesDb = new InvoicesOfflineDatabase();
  return invoicesDb;
}

export async function clearInvoicesOfflineDb() {
  const db = getInvoicesOfflineDb();
  if (!db) return;
  await db.transaction("rw", db.invoices, db.syncQueue, db.meta, async () => {
    await db.invoices.clear();
    await db.syncQueue.clear();
    await db.meta.clear();
  });
}
