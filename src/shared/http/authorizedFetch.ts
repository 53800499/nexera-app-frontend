import { AppError, AUTH_ERRORS } from "@/shared/core/AppError";
import { OfflineError } from "@/shared/core/OfflineError";
import { env } from "@/shared/config/env";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { fetchWithOfflineGuard } from "@/shared/http/fetchWithOfflineGuard";
import { parseApiErrorBody } from "@/shared/http/parseApiError";
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

  const response = await fetchWithOfflineGuard(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

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
