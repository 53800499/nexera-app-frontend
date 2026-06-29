import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiValidationError } from "@/shared/core/ApiValidationError";

const API_FIELD_ORDER = [
  "clientId",
  "issueDate",
  "expiryDate",
  "validUntil",
  "currency",
  "discountPct",
  "globalDiscountPct",
  "paymentTermId",
  "paymentTerms",
  "notes",
  "internalNotes",
  "legalMentions",
  "lines",
  "status",
  "target",
] as const;

/** Champs API → champs formulaire React Hook Form. */
const API_FIELD_TO_FORM: Record<string, string> = {
  discountPct: "globalDiscountPct",
  expiryDate: "validUntil",
  internalNotes: "legalMentions",
  paymentTerms: "paymentTermId",
};

export type FormApiErrorResult = {
  message: string | null;
  firstField: string | null;
};

export function applyFormApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): FormApiErrorResult {
  if (!(error instanceof ApiValidationError)) {
    return {
      message: error instanceof Error ? error.message : null,
      firstField: null,
    };
  }

  let firstField: string | null = null;

  const assignField = (field: string, message: string) => {
    if (field === "root") return;
    const formField = API_FIELD_TO_FORM[field] ?? field;
    setError(formField as Path<T>, { type: "server", message });
    if (!firstField) firstField = formField;
  };

  for (const field of API_FIELD_ORDER) {
    const message = error.fieldErrors[field];
    if (message) assignField(field, message);
  }

  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (
      API_FIELD_ORDER.includes(field as (typeof API_FIELD_ORDER)[number]) ||
      field === "root"
    ) {
      continue;
    }
    assignField(field, message);
  }

  const message = error.fieldErrors.root ?? error.message;

  return { message, firstField };
}
