import { OfflineError } from "@/shared/core/OfflineError";
import { env } from "@/shared/config/env";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { fetchWithOfflineGuard } from "@/shared/http/fetchWithOfflineGuard";
import { parseApiErrorBody } from "@/shared/http/parseApiError";
import { refreshAccessToken } from "@/shared/http/refreshAccessToken";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";
type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  refreshToken?: boolean;
  _retryOnAuthFail?: boolean;
};
export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = false,
    refreshToken = false,
    _retryOnAuthFail = true,
  } = options;

  if (!isBrowserOnline()) {
    throw new OfflineError();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth || refreshToken) {
    const token = refreshToken
      ? tokenStorage.getRefreshToken()
      : tokenStorage.getAccessToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetchWithOfflineGuard(`${env.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (
      env.apiBaseUrl !== "/api/backend" &&
      typeof window !== "undefined" &&
      err instanceof OfflineError
    ) {
      try {
        response = await fetchWithOfflineGuard(`/api/backend${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch {
        throw err;
      }
    } else {
      throw err;
    }
  }

  if (
    response.status === 401 &&
    auth &&
    !refreshToken &&
    _retryOnAuthFail &&
    path !== "/auth/refresh"
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiClient<T>(path, {
        ...options,
        _retryOnAuthFail: false,
      });
    }
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as Parameters<
      typeof parseApiErrorBody
    >[0];
    throw parseApiErrorBody(errorBody, response.status);
  }
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
