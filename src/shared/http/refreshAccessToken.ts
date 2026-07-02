import { env } from "@/shared/config/env";
import { fetchWithOfflineGuard } from "@/shared/http/fetchWithOfflineGuard";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

let refreshPromise: Promise<boolean> | null = null;

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

async function runRefresh(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetchWithOfflineGuard(`${env.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      tokenStorage.clearTokens();
      return false;
    }

    const body = (await response.json()) as RefreshResponse;
    if (!body.access_token || !body.refresh_token) {
      tokenStorage.clearTokens();
      return false;
    }

    tokenStorage.setTokens(
      {
        accessToken: body.access_token,
        refreshToken: body.refresh_token,
        expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
      },
      false,
    );

    return true;
  } catch {
    return false;
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
