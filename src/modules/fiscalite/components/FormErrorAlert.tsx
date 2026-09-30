"use client";

import React, { useCallback, useState } from "react";
import { ApiValidationError } from "@/shared/core/ApiValidationError";

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */

export type ParsedFormError = {
  summary: string;
  kind: "validation" | "business" | "network" | "server" | "unknown";
  fieldErrors: Record<string, string>;
  suggestions: string[];
  statusCode?: number;
};

/* ─────────────────────────────────────────────────────────────
   Hints métier → suggestions correctives
   ───────────────────────────────────────────────────────────── */

const BUSINESS_HINTS: { pattern: RegExp; suggestion: string }[] = [
  {
    pattern: /exercice.*existe|déjà.*exercice|exercise.*exists/i,
    suggestion:
      "Un exercice fiscal pour cette période existe déjà. Sélectionnez l'exercice existant ou choisissez une période différente.",
  },
  {
    pattern: /contribuable.*introuvable|not.*found.*contribuable/i,
    suggestion:
      "Votre profil contribuable n'a pas encore été configuré. Contactez votre administrateur fiscal.",
  },
  {
    pattern: /statut.*invalide|invalid.*status|état.*non autorisé|statut.*non autorisé/i,
    suggestion:
      "Cette action n'est pas autorisée dans l'état actuel de la déclaration. Vérifiez son statut (ex. brouillon requis) avant de continuer.",
  },
  {
    pattern: /valide.*définitif|validated.*definitively|already.*validated/i,
    suggestion:
      "Cette déclaration a déjà été validée définitivement. Créez-en une nouvelle si nécessaire.",
  },
  {
    pattern: /période.*couverte|period.*covered|période.*chevauchement/i,
    suggestion:
      "Une déclaration TVA pour cette période existe déjà. Sélectionnez une autre période ou modifiez la déclaration existante.",
  },
  {
    pattern: /barème.*introuvable|bareme.*not found/i,
    suggestion:
      "Le barème fiscal référencé est introuvable ou inactif. Vérifiez la configuration des barèmes dans les référentiels.",
  },
  {
    pattern: /droits.*insuffisants|permission.*denied|forbidden|interdit/i,
    suggestion:
      "Vous n'avez pas les droits suffisants pour effectuer cette action. Contactez votre administrateur.",
  },
  {
    pattern: /montant.*négatif|montant.*invalide|negative.*amount/i,
    suggestion: "Le montant saisi doit être positif et supérieur à 0.",
  },
  {
    pattern: /date.*invalide|invalid.*date|date.*début.*après|dateDebut|dateFin/i,
    suggestion:
      "La date saisie est invalide. Assurez-vous que la date de début précède la date de fin.",
  },
  {
    pattern: /natureOperation|nature.*operation|must be one of the following/i,
    suggestion:
      "La nature de l'opération sélectionnée n'est pas reconnue par l'API. Sélectionnez une valeur dans la liste proposée (ex. PRESTATION_SERVICE_IFU, ACHAT_COMMERCIAL_IFU).",
  },
  {
    pattern: /internal server error|erreur serveur/i,
    suggestion:
      "Erreur interne du serveur. Réessayez dans quelques instants ou contactez le support technique.",
  },
  {
    pattern: /réseau|network|fetch.*failed|failed.*fetch|connexion/i,
    suggestion:
      "Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.",
  },
];

const FIELD_LABELS: Record<string, string> = {
  taxContribuableId: "Contribuable",
  dateDebut: "Date de début de l'exercice",
  dateFin: "Date de clôture de l'exercice",
  periode: "Période de déclaration",
  dateLimiteLegale: "Date limite légale",
  creditTvaAnterieur: "Crédit TVA antérieur",
  nature: "Nature de l'opération TVA",
  tauxApplique: "Taux applicable",
  baseHorsTaxe: "Base hors taxe",
  montantTva: "Montant TVA calculé",
  sens: "Sens du retraitement",
  libelle: "Libellé",
  montant: "Montant",
  baseLegale: "Base légale (référence CGI)",
  natureOperation: "Nature de l'opération AIB",
  base: "Montant de base",
  nomSource: "Nom de la source réglementaire",
  typeSource: "Type de source",
  urlSource: "URL de la source",
  root: "Formulaire",
};

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

function getSuggestions(err: unknown): string[] {
  const msg = err instanceof Error ? err.message : String(err);
  for (const { pattern, suggestion } of BUSINESS_HINTS) {
    if (pattern.test(msg)) return [suggestion];
  }
  return [
    "Vérifiez les informations saisies et réessayez. Si le problème persiste, contactez le support.",
  ];
}

export function parseFormError(err: unknown): ParsedFormError {
  if (err instanceof ApiValidationError) {
    const suggestions = getSuggestions(err);
    const fieldKeys = Object.keys(err.fieldErrors);
    if (fieldKeys.length > 0 && suggestions.length < 2) {
      suggestions.push(
        `Corrigez le${fieldKeys.length > 1 ? "s" : ""} champ${fieldKeys.length > 1 ? "s" : ""} : ${fieldKeys.map(getFieldLabel).join(", ")}.`,
      );
    }
    return {
      summary: err.message,
      kind: "validation",
      fieldErrors: err.fieldErrors,
      suggestions,
      statusCode: err.statusCode,
    };
  }

  if (err instanceof Error) {
    if (
      err.message.toLowerCase().includes("failed to fetch") ||
      err.message.toLowerCase().includes("network")
    ) {
      return {
        summary: "Connexion impossible au serveur",
        kind: "network",
        fieldErrors: {},
        suggestions: [
          "Vérifiez votre connexion internet.",
          "Le serveur Nexera est peut-être temporairement indisponible. Réessayez dans quelques instants.",
        ],
      };
    }
    return {
      summary: err.message || "Une erreur inattendue est survenue",
      kind: "business",
      fieldErrors: {},
      suggestions: getSuggestions(err),
    };
  }

  return {
    summary: "Erreur inconnue",
    kind: "unknown",
    fieldErrors: {},
    suggestions: ["Rechargez la page et réessayez."],
  };
}

export function useFormError() {
  const [error, setError] = useState<ParsedFormError | null>(null);
  const captureError = useCallback((err: unknown) => setError(parseFormError(err)), []);
  const clearError = useCallback(() => setError(null), []);
  return { error, captureError, clearError };
}

/* ─────────────────────────────────────────────────────────────
   Composant FormErrorAlert
   ───────────────────────────────────────────────────────────── */

type FormErrorAlertProps = {
  error: ParsedFormError | null;
  onClose?: () => void;
  className?: string;
};

const KIND_STYLES = {
  validation: {
    border: "border-rose-300 dark:border-rose-700/70",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    icon: "text-rose-500",
    title: "text-rose-800 dark:text-rose-300",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    suggestion: "bg-rose-100/60 dark:bg-rose-900/20",
    fieldBg: "bg-white dark:bg-gray-900/60 border border-rose-200 dark:border-rose-800/60",
  },
  business: {
    border: "border-amber-300 dark:border-amber-700/70",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "text-amber-500",
    title: "text-amber-800 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    suggestion: "bg-amber-100/60 dark:bg-amber-900/20",
    fieldBg: "bg-white dark:bg-gray-900/60 border border-amber-200 dark:border-amber-800/60",
  },
  network: {
    border: "border-blue-300 dark:border-blue-700/70",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-500",
    title: "text-blue-800 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    suggestion: "bg-blue-100/60 dark:bg-blue-900/20",
    fieldBg: "bg-white dark:bg-gray-900/60 border border-blue-200 dark:border-blue-800/60",
  },
  server: {
    border: "border-orange-300 dark:border-orange-700/70",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    icon: "text-orange-500",
    title: "text-orange-800 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    suggestion: "bg-orange-100/60 dark:bg-orange-900/20",
    fieldBg: "bg-white dark:bg-gray-900/60 border border-orange-200 dark:border-orange-800/60",
  },
  unknown: {
    border: "border-gray-300 dark:border-gray-700",
    bg: "bg-gray-50 dark:bg-gray-800/50",
    icon: "text-gray-500",
    title: "text-gray-800 dark:text-gray-300",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    suggestion: "bg-gray-100/60 dark:bg-gray-800/40",
    fieldBg: "bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700",
  },
};

const KIND_LABELS: Record<ParsedFormError["kind"], string> = {
  validation: "Erreur de validation",
  business: "Erreur métier",
  network: "Erreur réseau",
  server: "Erreur serveur",
  unknown: "Erreur",
};

export function FormErrorAlert({ error, onClose, className = "" }: FormErrorAlertProps) {
  const [showDetails, setShowDetails] = useState(true);

  if (!error) return null;

  const styles = KIND_STYLES[error.kind];
  const fieldEntries = Object.entries(error.fieldErrors);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-xl border ${styles.border} ${styles.bg} p-4 space-y-3 ${className}`}
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className={`mt-0.5 shrink-0 ${styles.icon}`}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                {KIND_LABELS[error.kind]}
                {error.statusCode ? ` · HTTP ${error.statusCode}` : ""}
              </span>
            </div>
            <p className={`mt-1 text-sm font-semibold leading-snug ${styles.title}`}>
              {error.summary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {fieldEntries.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline underline-offset-2"
            >
              {showDetails ? "Masquer" : `${fieldEntries.length} champ${fieldEntries.length > 1 ? "s" : ""} invalide${fieldEntries.length > 1 ? "s" : ""}`}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              aria-label="Fermer l'alerte"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Erreurs par champ */}
      {showDetails && fieldEntries.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Champs à corriger ({fieldEntries.length})
          </p>
          <ul className="space-y-1.5">
            {fieldEntries.map(([field, message]) => (
              <li
                key={field}
                className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs ${styles.fieldBg}`}
              >
                <span className="mt-0.5 shrink-0 text-rose-500">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path
                      fillRule="evenodd"
                      d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm-.5-4.5v1.5h1v-1.5h-1zm0-6v4.5h1V4.5h-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {getFieldLabel(field)}
                  </span>
                  <span className="mx-1.5 text-gray-400">—</span>
                  <span className="text-gray-600 dark:text-gray-300">{message}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions correctives */}
      {error.suggestions.length > 0 && (
        <div className={`rounded-lg px-3 py-2.5 ${styles.suggestion}`}>
          <div className="flex items-start gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`}>
              <path
                fillRule="evenodd"
                d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.17.023-.342.023-.516a3.75 3.75 0 10-7.5 0c0 .174.008.346.023.516H12z"
                clipRule="evenodd"
              />
            </svg>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Comment corriger
              </p>
              <ul className="space-y-0.5">
                {error.suggestions.map((s, i) => (
                  <li key={i} className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                    {error.suggestions.length > 1 && (
                      <span className="font-semibold">{i + 1}. </span>
                    )}
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
