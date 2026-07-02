import { AppError } from "@/shared/core/AppError";
import { OfflineError, isOfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { isNetworkFetchError } from "@/shared/http/fetchWithOfflineGuard";

const CACHE_PREFIX = "nexera-ref-data";

type CacheEnvelope<T> = {
  updatedAt: string;
  data: T;
};

function cacheKey(key: string, tenantId?: string) {
  return `${CACHE_PREFIX}:${tenantId ?? "default"}:${key}`;
}

function readCache<T>(key: string, tenantId?: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(key, tenantId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T, tenantId?: string) {
  if (typeof window === "undefined") return;
  const envelope: CacheEnvelope<T> = {
    updatedAt: new Date().toISOString(),
    data,
  };
  localStorage.setItem(cacheKey(key, tenantId), JSON.stringify(envelope));
}

export function shouldFallbackToCache(error: unknown): boolean {
  if (isOfflineError(error) || isNetworkFetchError(error)) {
    return true;
  }
  if (error instanceof AppError) {
    return error.statusCode >= 500 || error.statusCode === 408;
  }
  return false;
}

export function getReferenceDataCache<T>(key: string, tenantId?: string): T | null {
  return readCache<T>(key, tenantId);
}

export async function readReferenceDataWithCache<T>(options: {
  key: string;
  tenantId?: string;
  onlineReader: () => Promise<T>;
  hasUsableCache?: (data: T) => boolean;
}): Promise<T> {
  const { key, tenantId, onlineReader } = options;
  const hasUsableCache =
    options.hasUsableCache ?? ((data: T) => Array.isArray(data) && data.length > 0);

  const cached = readCache<T>(key, tenantId);

  if (!isBrowserOnline()) {
    if (cached && hasUsableCache(cached)) {
      return cached;
    }
    throw new OfflineError();
  }

  try {
    const data = await onlineReader();
    writeCache(key, data, tenantId);
    return data;
  } catch (error) {
    if (cached && hasUsableCache(cached) && shouldFallbackToCache(error)) {
      return cached;
    }
    throw error;
  }
}

export function filterCatalogueItems<T extends { reference: string; name: string }>(
  items: T[],
  query?: string,
): T[] {
  const q = query?.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const haystack = `${item.reference} ${item.name}`.toLowerCase();
    return haystack.includes(q);
  });
}
