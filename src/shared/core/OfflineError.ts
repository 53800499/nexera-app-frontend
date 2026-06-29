export class OfflineError extends Error {
  constructor(message = "Réseau indisponible") {
    super(message);
    this.name = "OfflineError";
  }
}

export function isOfflineError(error: unknown): boolean {
  return error instanceof OfflineError;
}
