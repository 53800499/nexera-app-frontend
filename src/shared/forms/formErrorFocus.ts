import type { FieldErrors, FieldValues } from "react-hook-form";

const ROOT_FIELD_ORDER = [
  "clientId",
  "issueDate",
  "validUntil",
  "internalReference",
  "currency",
  "globalDiscountPct",
  "paymentTermId",
  "notes",
  "legalMentions",
  "lines",
] as const;

const LINE_FIELD_ORDER = [
  "description",
  "quantity",
  "unitPriceHt",
  "discountPct",
  "taxRateId",
] as const;

function lineErrorMessage(
  lineErrors: Record<string, { message?: string }> | undefined,
  index: number,
): { field: string; message: string } | null {
  if (!lineErrors) return null;

  for (const key of LINE_FIELD_ORDER) {
    const message = lineErrors[key]?.message;
    if (message) {
      return { field: `lines.${index}`, message };
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
    const element = document.querySelector(`[data-form-field="${field}"]`);
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
