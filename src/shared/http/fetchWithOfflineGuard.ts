import { OfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";

export function isNetworkFetchError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof Error &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("ERR_INTERNET_DISCONNECTED")))
  );
}

export async function fetchWithOfflineGuard(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (!isBrowserOnline()) {
    throw new OfflineError();
  }

  try {
    return await fetch(input, init);
  } catch (error) {
    if (isNetworkFetchError(error)) {
      throw new OfflineError();
    }
    throw error;
  }
}
