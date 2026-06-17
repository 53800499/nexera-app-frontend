export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;
