import { OfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";

export function isAbortError(error: unknown): boolean {
  if (!error) return false;
  if (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    return true;
  }
  if (error instanceof Error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      return true;
    }
    const msg = error.message.toLowerCase();
    if (
      msg.includes("the user aborted a request") ||
      msg.includes("operation was aborted") ||
      msg.includes("request was aborted")
    ) {
      return true;
    }
    const cause = (error as any).cause;
    if (cause && isAbortError(cause)) {
      return true;
    }
  }
  return false;
}

export function isNetworkFetchError(error: unknown): boolean {
  if (isAbortError(error)) {
    return false;
  }

  if (!isBrowserOnline()) {
    return true;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("network error") ||
      msg.includes("err_internet_disconnected") ||
      msg.includes("err_connection_refused") ||
      msg.includes("err_name_not_resolved") ||
      msg.includes("fetch failed") ||
      msg.includes("load failed")
    );
  }

  return false;
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
    if (isAbortError(error)) {
      throw error;
    }
    if (isNetworkFetchError(error)) {
      throw new OfflineError(
        isBrowserOnline()
          ? "Serveur ou réseau indisponible"
          : "Réseau indisponible",
      );
    }
    throw error;
  }
}

