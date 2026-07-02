import { OfflineError } from "@/shared/core/OfflineError";
import { env } from "@/shared/config/env";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { fetchWithOfflineGuard } from "@/shared/http/fetchWithOfflineGuard";
import { parseApiErrorBody } from "@/shared/http/parseApiError";
import { refreshAccessToken } from "@/shared/http/refreshAccessToken";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";

export async function authorizedFetch<T>(
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

  const alreadyRetried =
    typeof (options.headers as Record<string, string> | undefined)?.["x-auth-retried"] ===
    "string";

  const response = await fetchWithOfflineGuard(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && path !== "/auth/refresh" && !alreadyRetried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return authorizedFetch<T>(path, {
        ...options,
        headers: {
          ...(options.headers as Record<string, string>),
          "x-auth-retried": "1",
        },
      });
    }
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Parameters<
      typeof parseApiErrorBody
    >[0];
    throw parseApiErrorBody(body, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
