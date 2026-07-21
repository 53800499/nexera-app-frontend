import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiValidationError } from "@/shared/core/ApiValidationError";
import { fieldDisplayRank } from "@/shared/forms/formErrorFocus";
import { resolveFormErrorMessage } from "./resolveFormErrorMessage";

const API_FIELD_ORDER = [
  "email",
  "firstName",
  "lastName",
  "password",
  "roleIds",
  "name",
  "code",
  "rate",
  "days",
  "endOfMonth",
  "manualRate",
  "symbol",
  "prefix",
  "suffix",
  "separator",
  "draftMarker",
  "counterLength",
  "includeYear",
  "annualReset",
  "primaryCurrency",
  "legalName",
  "siret",
  "vatNumber",
  "logoUrl",
  "primaryColor",
  "layoutType",
  "body",
  "subject",
  "isDefault",
  "documentType",
  "description",
  "permissionIds",
  "isActive",
  "requestPasswordReset",
  "clientId",
  "orderId",
  "quotationId",
  "invoiceType",
  "issueDate",
  "dueDate",
  "expiryDate",
  "validUntil",
  "currency",
  "exchangeRate",
  "discountPct",
  "globalDiscountPct",
  "paymentTermId",
  "paymentTerms",
  "notes",
  "internalNotes",
  "legalMentions",
  "amount",
  "paymentMethod",
  "paymentDate",
  "allocationMode",
  "imputations",
  "reference",
  "cancelReason",
  "reason",
  "message",
  "subject",
  "channel",
  "level",
  "isEnabled",
  "level1DaysAfterDue",
  "level2DaysAfterDue",
  "level3DaysAfterDue",
  "commercialEmail",
  "directorEmail",
  "amountTtc",
  "lines",
  "status",
  "target",
] as const;

/** Champs API → champs formulaire React Hook Form (surcharge possible par formulaire). */
const API_FIELD_TO_FORM: Record<string, string> = {
  discountPct: "globalDiscountPct",
  expiryDate: "validUntil",
  paymentTerms: "paymentTermId",
  reason: "cancelReason",
};

const API_LINE_SUBFIELD_TO_FORM: Record<string, string> = {
  discountPct: "discountPct",
  unitPriceHt: "unitPriceHt",
  taxRateId: "taxRateId",
  description: "description",
  quantity: "quantity",
  itemId: "itemId",
};

export type FormApiErrorResult = {
  message: string | null;
  firstField: string | null;
};

function normalizeApiFieldKey(
  field: string,
  fieldMap?: Record<string, string>,
): string {
  const lineMatch = field.match(/^lines[\[.](\d+)[\].](\w+)$/i);
  if (lineMatch) {
    const [, index, subField] = lineMatch;
    const mapped = API_LINE_SUBFIELD_TO_FORM[subField] ?? subField;
    return `lines.${index}.${mapped}`;
  }

  const mapping = { ...API_FIELD_TO_FORM, ...fieldMap };
  return mapping[field] ?? field;
}

export function applyFormApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap?: Record<string, string>,
): FormApiErrorResult {
  if (!(error instanceof ApiValidationError)) {
    return {
      message: resolveFormErrorMessage(error),
      firstField: null,
    };
  }

  let firstField: string | null = null;
  let firstFieldRank = Number.POSITIVE_INFINITY;

  const assignField = (field: string, message: string) => {
    if (field === "root") return;
    const formField = normalizeApiFieldKey(field, fieldMap);
    setError(formField as Path<T>, { type: "server", message });
    const rank = fieldDisplayRank(formField);
    if (rank < firstFieldRank) {
      firstFieldRank = rank;
      firstField = formField;
    }
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
