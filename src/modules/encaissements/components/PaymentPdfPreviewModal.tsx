"use client";

import { Modal } from "@/components/ui/modal";
import { downloadPdfBlob } from "@/shared/pdf/pdfBlob";
import type { PaymentPdfPreviewState } from "../pdf/usePaymentPdf";

type PaymentPdfPreviewModalProps = {
  preview: PaymentPdfPreviewState | null;
  paymentLabel?: string;
  onClose: () => void;
};

export function PaymentPdfPreviewModal({
  preview,
  paymentLabel,
  onClose,
}: PaymentPdfPreviewModalProps) {
  if (!preview) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      className="max-w-5xl w-[95vw]"
      showCloseButton
    >
      <div className="flex flex-col p-4 pt-12 sm:p-6 sm:pt-14">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Aperçu de l&apos;encaissement
            </h2>
            {paymentLabel ? (
              <p className="text-sm text-gray-500">{paymentLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => downloadPdfBlob(preview.blob, preview.fileName)}
            className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-400"
          >
            Télécharger le PDF
          </button>
        </div>
        <iframe
          src={preview.url}
          title={`Aperçu ${paymentLabel ?? "encaissement"}`}
          className="h-[75vh] w-full rounded-xl border border-gray-200 bg-white dark:border-gray-700"
        />
      </div>
    </Modal>
  );
}
