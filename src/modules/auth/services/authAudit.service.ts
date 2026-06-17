import Dexie, { type EntityTable } from "dexie";
import type { AuthAuditLog } from "../types/auth.types";

class AuthAuditDatabase extends Dexie {
  authAudit!: EntityTable<AuthAuditLog, "id">;

  constructor() {
    super("nexera-auth-audit");
    this.version(1).stores({
      authAudit: "++id, action, status, createdAt",
    });
  }
}

let auditDb: AuthAuditDatabase | null = null;

function getAuditDb(): AuthAuditDatabase | null {
  if (typeof window === "undefined") return null;
  if (!auditDb) auditDb = new AuthAuditDatabase();
  return auditDb;
}

export async function logAuthAudit(
  entry: Omit<AuthAuditLog, "id">,
): Promise<void> {
  const db = getAuditDb();
  if (!db) return;
  await db.authAudit.add(entry);
}

export async function getAuthAuditLogs(limit = 50): Promise<AuthAuditLog[]> {
  const db = getAuditDb();
  if (!db) return [];
  return db.authAudit.orderBy("createdAt").reverse().limit(limit).toArray();
}
