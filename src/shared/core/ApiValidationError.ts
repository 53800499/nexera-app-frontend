import { AppError, AUTH_ERRORS } from "./AppError";

export class ApiValidationError extends AppError {
  readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    fieldErrors: Record<string, string>,
    statusCode = 400,
  ) {
    super(message, AUTH_ERRORS.VALIDATION_ERROR, statusCode);
    this.name = "ApiValidationError";
    this.fieldErrors = fieldErrors;
  }
}
