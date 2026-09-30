"use client";

import React, { useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { downloadPdfBlob } from "@/shared/pdf/pdfBlob";
import { PrinterIcon } from "./FiscaliteIcons";

export type FiscalitePdfPreviewState = {
  url: string;
  fileName: string;
  blob: Blob;
  title: string;
  subtitle?: string;
};

type Props = {
  preview: FiscalitePdfPreviewState | null;
  onClose: () => void;
};

export const FiscalitePdfPreviewModal: React.FC<Props> = ({
  preview,
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!preview) return null;

  const handlePrint = () => {
    try {
      iframeRef.current?.contentWindow?.focus();
      iframeRef.current?.contentWindow?.print();
    } catch {
      window.open(preview.url, "_blank");
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      className="max-w-5xl w-[95vw]"
      showCloseButton
    >
      <div className="flex flex-col p-4 pt-12 sm:p-6 sm:pt-14">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {preview.title}
            </h2>
            {preview.subtitle ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {preview.subtitle}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
              title="Lancer l'impression directe du document"
            >
              <PrinterIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              onClick={() => downloadPdfBlob(preview.blob, preview.fileName)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition shadow-sm"
              title="Télécharger le fichier PDF sur votre ordinateur"
            >
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Télécharger le PDF</span>
            </button>
          </div>
        </div>
        <iframe
          ref={iframeRef}
          src={preview.url}
          title={preview.title}
          className="h-[75vh] w-full rounded-xl border border-gray-200 bg-white dark:border-gray-700 shadow-inner"
        />
      </div>
    </Modal>
  );
};
