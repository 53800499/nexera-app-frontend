import type { InvoiceNormalizationStatus } from "../types/invoice.types";

type Props = {
  status?: InvoiceNormalizationStatus | null;
  className?: string;
  showIfNotNormalized?: boolean;
};

export function MecefStatusBadge({
  status,
  className = "",
  showIfNotNormalized = false,
}: Props) {
  if (!status || status === "not_normalized") {
    if (!showIfNotNormalized) return null;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        Non normalisée
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30 ${className}`}
      >
        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
        Certification en cours...
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30 ${className}`}
      >
        <svg
          className="h-3.5 w-3.5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        Échec DGI
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30 ${className}`}
      title="Certifiée conforme Direction Générale des Impôts (e-MECeF Bénin)"
    >
      <svg
        className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM13.707 8.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Normalisée DGI
    </span>
  );
}
