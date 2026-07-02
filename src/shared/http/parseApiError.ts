import { ApiValidationError } from "@/shared/core/ApiValidationError";
import { AppError, AUTH_ERRORS } from "@/shared/core/AppError";

type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[] | { message?: string; code?: string };
  code?: string;
  error?: string;
};

const FIELD_PATTERNS: { pattern: RegExp; field: string; label: string }[] = [
  { pattern: /\bemail\b/i, field: "email", label: "E-mail" },
  { pattern: /\bfirstName\b/i, field: "firstName", label: "Prénom" },
  { pattern: /\blastName\b/i, field: "lastName", label: "Nom" },
  { pattern: /\bpassword\b/i, field: "password", label: "Mot de passe" },
  { pattern: /\broleIds\b/i, field: "roleIds", label: "Rôles" },
  { pattern: /\broleId\b/i, field: "roleIds", label: "Rôle" },
  { pattern: /\bpermissionIds\b/i, field: "permissionIds", label: "Permissions" },
  { pattern: /\bpermissionId\b/i, field: "permissionIds", label: "Permission" },
  { pattern: /^name$/i, field: "name", label: "Nom du rôle" },
  { pattern: /^code$/i, field: "code", label: "Code du rôle" },
  { pattern: /^description$/i, field: "description", label: "Description" },
  { pattern: /\bisActive\b/i, field: "isActive", label: "Statut" },
  {
    pattern: /\brequestPasswordReset\b/i,
    field: "requestPasswordReset",
    label: "Réinitialisation du mot de passe",
  },
  { pattern: /\bclientId\b/i, field: "clientId", label: "Client" },
  { pattern: /\borderId\b/i, field: "orderId", label: "Bon de commande" },
  { pattern: /\bquotationId\b/i, field: "quotationId", label: "Devis source" },
  { pattern: /\binvoiceType\b/i, field: "invoiceType", label: "Type de facture" },
  { pattern: /\bissueDate\b/i, field: "issueDate", label: "Date" },
  { pattern: /\bdueDate\b/i, field: "dueDate", label: "Date d'échéance" },
  { pattern: /\bvalidUntil\b/i, field: "validUntil", label: "Date de validité" },
  { pattern: /\bexpiryDate\b/i, field: "validUntil", label: "Date de validité" },
  { pattern: /\bcurrency\b/i, field: "currency", label: "Devise" },
  { pattern: /\bexchangeRate\b/i, field: "exchangeRate", label: "Taux de change" },
  { pattern: /\bglobalDiscountPct\b/i, field: "globalDiscountPct", label: "Remise globale" },
  { pattern: /\bdiscountPct\b/i, field: "globalDiscountPct", label: "Remise globale" },
  { pattern: /\bpaymentTermId\b/i, field: "paymentTermId", label: "Conditions de paiement" },
  { pattern: /\bpaymentTerms\b/i, field: "paymentTermId", label: "Conditions de paiement" },
  { pattern: /\binternalNotes\b/i, field: "internalNotes", label: "Notes internes" },
  { pattern: /\blegalMentions\b/i, field: "legalMentions", label: "Mentions légales" },
  { pattern: /\bnotes\b/i, field: "notes", label: "Notes" },
  { pattern: /\bamount\b/i, field: "amount", label: "Montant" },
  { pattern: /\bpaymentMethod\b/i, field: "paymentMethod", label: "Mode de paiement" },
  { pattern: /\bpaymentDate\b/i, field: "paymentDate", label: "Date de paiement" },
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
  { pattern: /\bbillingPct\b/i, field: "billingPct", label: "Pourcentage de facturation" },
  { pattern: /\bamountTtc\b/i, field: "amountTtc", label: "Montant TTC" },
  { pattern: /\ballocationMode\b/i, field: "allocationMode", label: "Mode d'imputation" },
  { pattern: /\bimputations\b/i, field: "imputations", label: "Imputations" },
  { pattern: /\binvoiceId\b/i, field: "imputations", label: "Facture imputée" },
  { pattern: /\bcancelReason\b/i, field: "cancelReason", label: "Motif d'annulation" },
  { pattern: /\breason\b/i, field: "cancelReason", label: "Motif" },
  { pattern: /\breference\b/i, field: "reference", label: "Référence" },
  {
    pattern: /\brecipientEmail\b/i,
    field: "recipientEmail",
    label: "E-mail du destinataire",
  },
  { pattern: /\bsubject\b/i, field: "subject", label: "Objet" },
  { pattern: /\bchannel\b/i, field: "channel", label: "Canal" },
  { pattern: /\blevel\b/i, field: "level", label: "Niveau de relance" },
  { pattern: /\bmessage\b/i, field: "message", label: "Message" },
  { pattern: /\bisEnabled\b/i, field: "isEnabled", label: "Activation des relances" },
  {
    pattern: /\blevel1DaysAfterDue\b/i,
    field: "level1DaysAfterDue",
    label: "Délai niveau 1",
  },
  {
    pattern: /\blevel2DaysAfterDue\b/i,
    field: "level2DaysAfterDue",
    label: "Délai niveau 2",
  },
  {
    pattern: /\blevel3DaysAfterDue\b/i,
    field: "level3DaysAfterDue",
    label: "Délai niveau 3",
  },
  {
    pattern: /\bcommercialEmail\b/i,
    field: "commercialEmail",
    label: "E-mail commercial",
  },
  {
    pattern: /\bdirectorEmail\b/i,
    field: "directorEmail",
    label: "E-mail dirigeant",
  },
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

function getFieldLabel(fieldName: string): string {
  const match = FIELD_PATTERNS.find(({ pattern }) => pattern.test(fieldName));
  return match?.label ?? fieldName;
}

const FULL_MESSAGE_TRANSLATIONS: { pattern: RegExp; message: string }[] = [
  {
    pattern:
      /role already exists|code already exists|duplicate.*code|code.*already|already.*code/i,
    message: "Ce code de rôle est déjà utilisé pour cette organisation.",
  },
  {
    pattern:
      /user already exists|user with this email|email already|email.*already|already.*email|duplicate.*email|email.*taken|email.*registered|unique.*email|e11000.*email/i,
    message: "Cette adresse e-mail est déjà utilisée par un autre compte.",
  },
  {
    pattern: /each value in roleIds|roleids.*uuid|invalid role|roles?.*not found|role.*does not exist/i,
    message: "Un ou plusieurs rôles sélectionnés ne sont pas valides.",
  },
  {
    pattern: /tenant.*limit|maximum.*users|user limit|too many users/i,
    message: "Le nombre maximal d'utilisateurs autorisés est atteint.",
  },
  {
    pattern: /^validation failed$/i,
    message: "Certaines informations saisies sont invalides. Vérifiez les champs en rouge.",
  },
  {
    pattern: /^unauthorized$/i,
    message: "Vous n'avez pas les droits pour effectuer cette action.",
  },
  {
    pattern: /^forbidden$/i,
    message: "Action interdite avec vos droits actuels.",
  },
  {
    pattern: /^conflict$/i,
    message: "Ces informations entrent en conflit avec un compte existant.",
  },
  {
    pattern: /^bad request$/i,
    message: "Les informations envoyées sont invalides. Vérifiez le formulaire.",
  },
  {
    pattern: /^internal server error$/i,
    message: "Erreur serveur. Réessayez dans quelques instants.",
  },
];

function translateClassValidatorMessage(raw: string, label: string): string | null {
  if (/must be an email|must be a valid email|invalid email/i.test(raw)) {
    return `${label} invalide — utilisez un format valide (ex. nom@domaine.fr)`;
  }
  if (/must be longer than or equal to (\d+)|at least (\d+) characters/i.test(raw)) {
    const min = raw.match(/(\d+)/)?.[1] ?? "2";
    return `${label} : ${min} caractères minimum`;
  }
  if (/must be shorter than or equal to|must not be greater than/i.test(raw)) {
    return `${label} : valeur trop longue`;
  }
  if (/must not be empty|should not be empty|must be defined|should not be null/i.test(raw)) {
    return `${label} obligatoire`;
  }
  if (/must be a uuid|must be a UUID/i.test(raw)) {
    return `${label} invalide`;
  }
  if (/must be a number|must be a positive number/i.test(raw)) {
    return `${label} : nombre invalide`;
  }
  if (/must be greater|minimum|min/i.test(raw)) {
    return `${label} : valeur trop basse`;
  }
  if (/is not strong enough|too weak|password.*weak/i.test(raw)) {
    return `${label} : utilisez au moins 8 caractères (lettres et chiffres recommandés)`;
  }
  if (/must be a boolean/i.test(raw)) {
    return `${label} : valeur invalide`;
  }
  if (/must be a string/i.test(raw)) {
    return `${label} : texte invalide`;
  }
  if (/must be an array|array must/i.test(raw)) {
    return `${label} : format invalide`;
  }
  return null;
}

function inferFieldFromMessage(raw: string): string | null {
  const propertyPrefix = raw.match(/^(\w+)\s+(must|should)/i)?.[1];
  if (propertyPrefix) {
    return (
      FIELD_PATTERNS.find(({ pattern }) => pattern.test(propertyPrefix))?.field ??
      propertyPrefix
    );
  }

  const eachValue = raw.match(/each value in (\w+)/i)?.[1];
  if (eachValue) {
    return (
      FIELD_PATTERNS.find(({ pattern }) => pattern.test(eachValue))?.field ??
      eachValue
    );
  }

  if (/role already exists|code already exists|duplicate.*code/i.test(raw)) return "code";
  if (/user already exists/i.test(raw)) return "email";
  if (/email/i.test(raw) && /already|exist|duplicate|taken|registered|unique/i.test(raw)) {
    return "email";
  }
  if (/\bpassword\b/i.test(raw)) return "password";
  if (/\bfirstName\b/i.test(raw)) return "firstName";
  if (/\blastName\b/i.test(raw)) return "lastName";
  if (/\broleIds?\b/i.test(raw) || /\broles?\b/i.test(raw)) return "roleIds";

  const match = FIELD_PATTERNS.find(({ pattern }) => pattern.test(raw));
  return match?.field ?? null;
}

function conciseValidationMessage(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Champ invalide";

  for (const { pattern, message } of FULL_MESSAGE_TRANSLATIONS) {
    if (pattern.test(trimmed)) return message;
  }

  const forbiddenProperty = trimmed.match(
    /(?:property|propriété)\s+(\w+)\s+should not exist/i,
  );
  if (forbiddenProperty) {
    const fieldName = forbiddenProperty[1];
    return `${getFieldLabel(fieldName)} non accepté par l'API`;
  }

  if (/ne sont pas autorisés|not allowed|should not exist/i.test(trimmed)) {
    return "Certains champs envoyés ne sont pas acceptés par l'API";
  }

  const propertyMatch = trimmed.match(/^(\w+)\s+(must|should)/i);
  if (propertyMatch) {
    const label = getFieldLabel(propertyMatch[1]);
    const translated = translateClassValidatorMessage(trimmed, label);
    if (translated) return translated;
  }

  const eachMatch = trimmed.match(/each value in (\w+)/i);
  if (eachMatch) {
    const label = getFieldLabel(eachMatch[1]);
    if (/uuid/i.test(trimmed)) {
      return `${label} : un ou plusieurs éléments sont invalides`;
    }
  }

  for (const { pattern, label } of FIELD_PATTERNS) {
    if (pattern.test(trimmed)) {
      const lineMatch = trimmed.match(/\blines[\[.](\d+)[\].](\w+)\b/i);
      const linePrefix = lineMatch
        ? `Ligne ${Number(lineMatch[1]) + 1} — `
        : "";

      if (/must not be empty|should not be empty|required|obligatoire/i.test(trimmed)) {
        return `${linePrefix}${label} obligatoire`;
      }
      if (/must be a UUID|uuid/i.test(trimmed)) {
        return `${linePrefix}${label} invalide`;
      }
      if (/must be a number|number/i.test(trimmed)) {
        return `${linePrefix}${label} : nombre invalide`;
      }
      if (/must be greater|minimum|min/i.test(trimmed)) {
        return `${linePrefix}${label} : valeur trop basse`;
      }
      if (/already|exist|duplicate|taken/i.test(trimmed)) {
        return `${linePrefix}${label} : valeur déjà utilisée`;
      }
      return `${linePrefix}${label} invalide`;
    }
  }

  return trimmed;
}

function mapFieldErrors(messages: string[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const raw of messages) {
    const lineMatch = raw.match(/\blines[\[.](\d+)[\].](\w+)\b/i);
    const concise = conciseValidationMessage(raw);
    if (lineMatch) {
      const field = `lines.${lineMatch[1]}.${lineMatch[2]}`;
      if (!fieldErrors[field]) {
        fieldErrors[field] = concise;
      }
      continue;
    }

    const field = inferFieldFromMessage(raw) ?? "root";
    if (!fieldErrors[field]) {
      fieldErrors[field] = concise;
    }
  }

  return fieldErrors;
}

function buildConflictValidationError(
  messages: string[],
  statusCode: number,
): ApiValidationError | null {
  if (messages.length === 0) return null;
  const raw = messages[0];

  if (
    /role already exists|code already exists|duplicate.*code/i.test(raw) ||
    (/code/i.test(raw) &&
      /already|exist|duplicate|taken|registered|unique|conflict/i.test(raw))
  ) {
    const message = "Ce code de rôle est déjà utilisé pour cette organisation.";
    return new ApiValidationError(message, { code: message }, statusCode);
  }

  if (
    /user already exists|user with this email/i.test(raw) ||
    (/email/i.test(raw) &&
      /already|exist|duplicate|taken|registered|unique|conflict/i.test(raw))
  ) {
    const message = "Cette adresse e-mail est déjà utilisée par un autre compte.";
    return new ApiValidationError(message, { email: message }, statusCode);
  }

  if (/role/i.test(raw)) {
    const message = "Un ou plusieurs rôles sélectionnés ne sont pas valides.";
    return new ApiValidationError(message, { roleIds: message }, statusCode);
  }

  return null;
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
        ? conciseValidationMessage(nested.message)
        : typeof body.error === "string"
          ? conciseValidationMessage(body.error)
          : "Une erreur est survenue"
      : messages.length === 1
        ? conciseValidationMessage(messages[0])
        : messages.map(conciseValidationMessage).join(" · ");

  const validationStatuses = [400, 409, 422];
  if (validationStatuses.includes(statusCode) && Object.keys(fieldErrors).length > 0) {
    return new ApiValidationError(message, fieldErrors, statusCode);
  }

  if (statusCode === 409) {
    const conflictError = buildConflictValidationError(messages, statusCode);
    if (conflictError) return conflictError;
  }

  return new AppError(
    message,
    nested.code ?? body.code ?? AUTH_ERRORS.UNAUTHORIZED,
    statusCode,
  );
}
