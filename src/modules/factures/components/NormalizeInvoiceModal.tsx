"use client";

import { useState } from "react";
import type {
  InvoiceDetail,
  MecefAibType,
  NormalizeInvoicePayload,
} from "../types/invoice.types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetail;
  onConfirm: (payload: NormalizeInvoicePayload) => Promise<void>;
  isSubmitting: boolean;
};

export function NormalizeInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onConfirm,
  isSubmitting,
}: Props) {
  const [aibType, setAibType] = useState<MecefAibType>(
    invoice.mecefAibType || "NONE",
  );

  if (!isOpen) return null;

  const totalHt = invoice.subtotalHt ?? 0;
  const aibRate = aibType === "A" ? 0.01 : aibType === "B" ? 0.05 : 0;
  const aibAmount = Math.round(totalHt * aibRate * 100) / 100;
  const totalTtc = invoice.totalTtc;
  const netToPay = totalTtc + aibAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      aibType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Normalisation Fiscale e-MECeF
              </h3>
              <p className="text-xs text-gray-500">
                Direction Générale des Impôts (DGI Bénin)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Vous vous apprêtez à certifier la facture{" "}
            <strong className="text-gray-900 dark:text-white">
              {invoice.number}
            </strong>{" "}
            auprès du serveur officiel e-MECeF. Cette opération est définitive
            et génère un QR code fiscal et un code de sécurité DGI infalsifiable.
          </p>

          {/* AIB Selector */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Acompte sur Impôt Assis sur les Bénéfices (AIB)
            </label>
            <p className="mt-0.5 text-xs text-gray-500">
              Sélectionnez le taux applicable selon le statut fiscal du client.
            </p>

            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-white dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="aibType"
                  value="NONE"
                  checked={aibType === "NONE"}
                  onChange={() => setAibType("NONE")}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Aucun AIB (0 %)
                  </span>
                  <span className="block text-xs text-gray-500">
                    Particuliers, ventes au détail ou opérations non assujetties
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-white dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="aibType"
                  value="A"
                  checked={aibType === "A"}
                  onChange={() => setAibType("A")}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    AIB Groupe A (1 %)
                  </span>
                  <span className="block text-xs text-gray-500">
                    Client entreprise / professionnel immatriculé avec IFU valide
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-white dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="aibType"
                  value="B"
                  checked={aibType === "B"}
                  onChange={() => setAibType("B")}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    AIB Groupe B (5 %)
                  </span>
                  <span className="block text-xs text-gray-500">
                    Personnes morales ou prestataires sans IFU ou non immatriculés
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Financial summary preview */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-sm dark:border-emerald-800/40 dark:bg-emerald-950/20">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Montant HT :</span>
              <span>
                {totalHt.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                {invoice.currency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Total TVA :</span>
              <span>
                {(invoice.totalTax ?? 0).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                })}{" "}
                {invoice.currency}
              </span>
            </div>
            {aibRate > 0 && (
              <div className="flex justify-between text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span>AIB ({aibType === "A" ? "1 %" : "5 %"}) :</span>
                <span>
                  +
                  {aibAmount.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  {invoice.currency}
                </span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-emerald-200/60 pt-2 font-bold text-gray-900 dark:border-emerald-800/40 dark:text-white">
              <span>Net à payer :</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                {netToPay.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                {invoice.currency}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  Signature e-MECeF en cours...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Confirmer & Certifier DGI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
