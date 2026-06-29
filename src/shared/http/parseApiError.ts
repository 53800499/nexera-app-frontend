import { ApiValidationError } from "@/shared/core/ApiValidationError";
import { AppError, AUTH_ERRORS } from "@/shared/core/AppError";

type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[] | { message?: string; code?: string };
  code?: string;
  error?: string;
};

const FIELD_PATTERNS: { pattern: RegExp; field: string; label: string }[] = [
  { pattern: /\bclientId\b/i, field: "clientId", label: "Client" },
  { pattern: /\bissueDate\b/i, field: "issueDate", label: "Date du devis" },
  { pattern: /\bvalidUntil\b/i, field: "validUntil", label: "Date de validité" },
  { pattern: /\bexpiryDate\b/i, field: "validUntil", label: "Date de validité" },
  { pattern: /\bcurrency\b/i, field: "currency", label: "Devise" },
  { pattern: /\bglobalDiscountPct\b/i, field: "globalDiscountPct", label: "Remise globale" },
  { pattern: /\bdiscountPct\b/i, field: "globalDiscountPct", label: "Remise globale" },
  { pattern: /\bpaymentTermId\b/i, field: "paymentTermId", label: "Conditions de paiement" },
  { pattern: /\bpaymentTerms\b/i, field: "paymentTermId", label: "Conditions de paiement" },
  { pattern: /\binternalNotes\b/i, field: "legalMentions", label: "Notes internes" },
  { pattern: /\blegalMentions\b/i, field: "legalMentions", label: "Mentions légales" },
  { pattern: /\bnotes\b/i, field: "notes", label: "Notes" },
  { pattern: /\blines\.\d+\.description\b/i, field: "lines", label: "Description ligne" },
  { pattern: /\blines\.\d+\.quantity\b/i, field: "lines", label: "Quantité" },
  { pattern: /\blines\.\d+\.unitPriceHt\b/i, field: "lines", label: "Prix unitaire" },
  { pattern: /\blines\.\d+\.taxRateId\b/i, field: "lines", label: "TVA" },
  { pattern: /\blines\b/i, field: "lines", label: "Lignes" },
  { pattern: /\bdescription\b/i, field: "lines", label: "Description" },
  { pattern: /\bquantity\b/i, field: "lines", label: "Quantité" },
  { pattern: /\bunitPriceHt\b/i, field: "lines", label: "Prix unitaire" },
  { pattern: /\btaxRateId\b/i, field: "lines", label: "TVA" },
  { pattern: /\bstatus\b/i, field: "status", label: "Statut" },
  { pattern: /\btarget\b/i, field: "target", label: "Type de conversion" },
];

function toMessageList(message: ApiErrorBody["message"]): string[] {
  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === "string");
  }
  if (typeof message === "string") return [message];
  if (message && typeof message === "object" && typeof message.message === "string") {
    return [message.message];
  }
  return [];
}

function conciseValidationMessage(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Champ invalide";

  const forbiddenProperty = trimmed.match(
    /(?:property|propriété)\s+(\w+)\s+should not exist/i,
  );
  if (forbiddenProperty) {
    const fieldName = forbiddenProperty[1];
    const match = FIELD_PATTERNS.find(({ pattern }) =>
      pattern.test(fieldName),
    );
    return match
      ? `${match.label} non accepté par l'API`
      : `Champ « ${fieldName} » non accepté`;
  }

  if (/ne sont pas autorisés|not allowed|should not exist/i.test(trimmed)) {
    return "Certains champs envoyés ne sont pas acceptés par l'API";
  }

  for (const { pattern, label } of FIELD_PATTERNS) {
    if (pattern.test(trimmed)) {
      if (/must not be empty|should not be empty|required|obligatoire/i.test(trimmed)) {
        return `${label} obligatoire`;
      }
      if (/must be a UUID|uuid/i.test(trimmed)) {
        return `${label} invalide`;
      }
      if (/must be a number|number/i.test(trimmed)) {
        return `${label} : nombre invalide`;
      }
      if (/must be greater|minimum|min/i.test(trimmed)) {
        return `${label} : valeur trop basse`;
      }
      return `${label} invalide`;
    }
  }

  return trimmed;
}

function mapFieldErrors(messages: string[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const raw of messages) {
    const concise = conciseValidationMessage(raw);
    const match = FIELD_PATTERNS.find(({ pattern }) => pattern.test(raw));
    const field = match?.field ?? "root";
    if (!fieldErrors[field]) {
      fieldErrors[field] = concise;
    }
  }

  return fieldErrors;
}

export function parseApiErrorBody(
  body: ApiErrorBody,
  statusCode: number,
): AppError {
  const nested =
    typeof body.message === "object" && body.message !== null && !Array.isArray(body.message)
      ? body.message
      : body;

  const messages = toMessageList(body.message);
  const fieldErrors = mapFieldErrors(messages);

  const message =
    messages.length === 0
      ? typeof nested.message === "string"
        ? nested.message
        : "Une erreur est survenue"
      : messages.length === 1
        ? conciseValidationMessage(messages[0])
        : messages.map(conciseValidationMessage).join(" · ");

  if (statusCode === 400 && Object.keys(fieldErrors).length > 0) {
    return new ApiValidationError(message, fieldErrors, statusCode);
  }

  return new AppError(
    message,
    nested.code ?? body.code ?? AUTH_ERRORS.UNAUTHORIZED,
    statusCode,
  );
}
