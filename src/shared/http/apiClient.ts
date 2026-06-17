import { AppError, AUTH_ERRORS } from "@/shared/core/AppError";
import { env } from "@/shared/config/env";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  refreshToken?: boolean;
};

type ApiErrorBody = {
  message?: string | string[];
  code?: string;
};

function normalizeMessage(message?: string | string[]): string {
  if (Array.isArray(message)) return message.join(", ");
  return message ?? "Une erreur est survenue";
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = false, refreshToken = false } = options;

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

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = normalizeMessage(errorBody.message);

    throw new AppError(
      message,
      errorBody.code ?? AUTH_ERRORS.UNAUTHORIZED,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
