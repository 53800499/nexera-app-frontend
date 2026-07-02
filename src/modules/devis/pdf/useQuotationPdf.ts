"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  PDF_TEMPLATE_KEY,
  TENANT_SETTINGS_KEY,
} from "@/modules/parametres/hooks/useSettings";
import type {
  PdfTemplate,
  TenantSettings,
} from "@/modules/parametres/types/settings.types";
import { revokePdfPreviewUrl } from "@/shared/pdf/pdfBlob";
import type { QuotationDetail } from "../types/quotation.types";
import {
  createQuotationPreviewUrl,
  downloadQuotationPdf,
} from "./quotationPdf.service";

export type QuotationPdfPreviewState = {
  url: string;
  fileName: string;
  blob: Blob;
};

export function useQuotationPdf() {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<QuotationPdfPreviewState | null>(null);

  const getCachedSettings = useCallback(() => {
    return {
      tenant:
        queryClient.getQueryData<TenantSettings>(TENANT_SETTINGS_KEY) ?? null,
      template:
        queryClient.getQueryData<PdfTemplate>(PDF_TEMPLATE_KEY) ?? null,
    };
  }, [queryClient]);

  const closePreview = useCallback(() => {
    setPreview((current) => {
      if (current) revokePdfPreviewUrl(current.url);
      return null;
    });
  }, []);

  useEffect(() => {
    const url = preview?.url;
    return () => {
      if (url) revokePdfPreviewUrl(url);
    };
  }, [preview?.url]);

  const openPreview = useCallback(
    async (quotation: QuotationDetail) => {
      closePreview();
      const cached = getCachedSettings();
      const result = await createQuotationPreviewUrl(quotation, cached);
      setPreview({
        url: result.url,
        fileName: result.fileName,
        blob: result.blob,
      });
    },
    [closePreview, getCachedSettings],
  );

  const downloadPdf = useCallback(
    async (quotation: QuotationDetail) => {
      const cached = getCachedSettings();
      await downloadQuotationPdf(quotation, cached);
    },
    [getCachedSettings],
  );

  return {
    preview,
    openPreview,
    downloadPdf,
    closePreview,
  };
}
