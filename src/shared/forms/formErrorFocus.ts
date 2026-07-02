import type { FieldErrors, FieldValues } from "react-hook-form";

const ROOT_FIELD_ORDER = [
  "email",
  "firstName",
  "lastName",
  "password",
  "roleIds",
  "name",
  "code",
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
  "validUntil",
  "internalReference",
  "currency",
  "exchangeRate",
  "globalDiscountPct",
  "paymentTermId",
  "notes",
  "internalNotes",
  "legalMentions",
  "allocationMode",
  "amount",
  "paymentMethod",
  "paymentDate",
  "reference",
  "imputations",
  "cancelReason",
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
] as const;

const LINE_FIELD_ORDER = [
  "description",
  "quantity",
  "unitPriceHt",
  "discountPct",
  "taxRateId",
] as const;

export function fieldDisplayRank(field: string): number {
  const rootIndex = ROOT_FIELD_ORDER.indexOf(
    field as (typeof ROOT_FIELD_ORDER)[number],
  );
  if (rootIndex >= 0) return rootIndex;

  const lineMatch = field.match(/^lines\.(\d+)(?:\.(\w+))?$/);
  if (lineMatch) {
    const lineIndex = Number(lineMatch[1]);
    const subField = lineMatch[2];
    const subIndex = subField
      ? LINE_FIELD_ORDER.indexOf(subField as (typeof LINE_FIELD_ORDER)[number])
      : 0;
    return (
      ROOT_FIELD_ORDER.length +
      lineIndex * 20 +
      (subIndex >= 0 ? subIndex : 0)
    );
  }

  return 9_999;
}

function lineErrorMessage(
  lineErrors: Record<string, { message?: string }> | undefined,
  index: number,
): { field: string; message: string } | null {
  if (!lineErrors) return null;

  for (const key of LINE_FIELD_ORDER) {
    const message = lineErrors[key]?.message;
    if (message) {
      return { field: `lines.${index}.${key}`, message };
    }
  }

  return null;
}

export function findFirstFormError<T extends FieldValues>(
  errors: FieldErrors<T>,
): { field: string; message: string } | null {
  for (const field of ROOT_FIELD_ORDER) {
    const error = errors[field as keyof typeof errors];

    if (field === "lines") {
      if (error && typeof error === "object" && "message" in error && error.message) {
        return { field, message: String(error.message) };
      }

      if (Array.isArray(error)) {
        for (let index = 0; index < error.length; index += 1) {
          const lineError = lineErrorMessage(
            error[index] as Record<string, { message?: string }>,
            index,
          );
          if (lineError) return lineError;
        }
      }
      continue;
    }

    if (error && typeof error === "object" && "message" in error && error.message) {
      return { field, message: String(error.message) };
    }
  }

  return null;
}

export function scrollToFormField(field: string) {
  requestAnimationFrame(() => {
    let element = document.querySelector(`[data-form-field="${field}"]`);

    if (!element && field.startsWith("lines.")) {
      const lineIndex = field.match(/^lines\.(\d+)/)?.[1];
      if (lineIndex) {
        element = document.querySelector(
          `[data-form-field="lines.${lineIndex}"]`,
        );
      }
    }

    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    const focusable = element.querySelector<HTMLElement>(
      'input:not([type="hidden"]), select, textarea',
    );
    focusable?.focus({ preventScroll: true });
  });
}

export function focusFirstFormError<T extends FieldValues>(
  errors: FieldErrors<T>,
): { field: string; message: string } | null {
  const firstError = findFirstFormError(errors);
  if (!firstError) return null;
  scrollToFormField(firstError.field);
  return firstError;
}
