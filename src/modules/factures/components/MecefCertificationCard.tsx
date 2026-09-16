"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { InvoiceDetail } from "../types/invoice.types";

type Props = {
  invoice: InvoiceDetail;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export function MecefCertificationCard({
  invoice,
  onRetry,
  isRetrying = false,
}: Props) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    normalizationStatus,
    mecefCode,
    mecefNim,
    mecefCounters,
    mecefQrCodeData,
    mecefNormalizedAt,
    mecefAibType,
    mecefAibAmount,
    mecefErrorMessage,
    originalMecefCode,
  } = invoice;

  useEffect(() => {
    const qrData = mecefQrCodeData || mecefCode;
    if (!qrData) {
      setQrCodeDataUrl(null);
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(qrData, {
      width: 160,
      margin: 1,
      color: {
        dark: "#064e3b", // dark emerald
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error("Erreur génération QR Code e-MECeF:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [mecefQrCodeData, mecefCode]);

  const copyCode = async () => {
    if (!mecefCode) return;
    try {
      await navigator.clipboard.writeText(mecefCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formattedDate = mecefNormalizedAt
    ? new Date(mecefNormalizedAt).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  if (normalizationStatus === "failed") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 dark:border-red-900/40 dark:bg-red-950/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
              <svg
                className="h-5 w-5"
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
            </div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">
                Échec de la certification e-MECeF (DGI)
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {mecefErrorMessage ||
                  "Une erreur est survenue lors de la signature par la plateforme e-MECeF."}
              </p>
            </div>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRetrying ? "Reconnexion..." : "Réessayer"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (normalizationStatus !== "normalized") {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-transparent p-5 shadow-sm dark:border-emerald-500/20 dark:from-emerald-950/20 dark:via-emerald-950/10">
      {/* Decorative background seal */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-5 dark:opacity-10">
        <svg
          className="h-44 w-44 text-emerald-800"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/60 pb-3.5 dark:border-emerald-800/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <svg
              className="h-4.5 w-4.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM13.707 8.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
              Direction Générale des Impôts (DGI Bénin)
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Facture Certifiée Conforme — e-MECeF
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Signature Numérique Validée
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* Left: QR Code scannable */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200/80 bg-white p-3 shadow-inner md:col-span-3 dark:border-emerald-800/60 dark:bg-gray-900">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="QR Code e-MECeF scannable"
              className="h-32 w-32 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
              QR Code
            </div>
          )}
          <span className="mt-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-400">
            Scannez pour vérifier
          </span>
        </div>

        {/* Right: Certified details */}
        <div className="space-y-3 md:col-span-9">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Code de sécurité MECeF (DGI) :
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-emerald-900 select-all sm:text-base dark:text-emerald-300">
                {mecefCode || "—"}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                title="Copier le code MECeF"
              >
                {copied ? (
                  <>
                    <svg
                      className="h-3.5 w-3.5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copié !
                  </>
                ) : (
                  <>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
            <div className="rounded-lg bg-white/70 p-2.5 dark:bg-gray-800/70">
              <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                NIM (Machine)
              </dt>
              <dd className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                {mecefNim || "N/A"}
              </dd>
            </div>

            <div className="rounded-lg bg-white/70 p-2.5 dark:bg-gray-800/70">
              <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                Compteurs (MC/TC)
              </dt>
              <dd className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                {mecefCounters || "N/A"}
              </dd>
            </div>

            <div className="rounded-lg bg-white/70 p-2.5 dark:bg-gray-800/70">
              <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                Date certification
              </dt>
              <dd className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {formattedDate || "N/A"}
              </dd>
            </div>

            <div className="rounded-lg bg-white/70 p-2.5 dark:bg-gray-800/70">
              <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                AIB appliqué
              </dt>
              <dd className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {mecefAibType === "A"
                  ? "A (1 % - IFU)"
                  : mecefAibType === "B"
                    ? "B (5 % - Sans IFU)"
                    : "Aucun (0 %)"}
                {Boolean(mecefAibAmount && mecefAibAmount > 0) && (
                  <span className="block text-[11px] font-normal text-gray-500">
                    {mecefAibAmount?.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {invoice.currency}
                  </span>
                )}
              </dd>
            </div>
          </div>

          {originalMecefCode && (
            <div className="rounded-lg border border-emerald-200/50 bg-white/50 px-3 py-1.5 text-xs text-gray-600 dark:border-emerald-800/30 dark:bg-gray-800/40 dark:text-gray-300">
              <span className="font-medium text-emerald-800 dark:text-emerald-400">
                Facture d'origine certifiée :
              </span>{" "}
              <span className="font-mono">{originalMecefCode}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
