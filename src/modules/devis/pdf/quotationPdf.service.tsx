import { pdf } from "@react-pdf/renderer";
import type {
  PdfTemplate,
  TenantSettings,
} from "@/modules/parametres/types/settings.types";
import { settingsApi } from "@/modules/parametres/services/settingsApi.service";
import {
  createPdfPreviewUrl,
  downloadPdfBlob,
} from "@/shared/pdf/pdfBlob";
import type { QuotationDetail } from "../types/quotation.types";
import { QuotationPdfDocument } from "./QuotationPdfDocument";
import { sanitizePdfFileName } from "./quotationPdfFormat";
import type {
  QuotationPdfContext,
  QuotationPdfMode,
} from "./quotationPdf.types";

const DEFAULT_TENANT: TenantSettings = {
  primaryCurrency: "EUR",
  exchangeRateSource: "manual",
};

const DEFAULT_TEMPLATE: PdfTemplate = {
  primaryColor: "#2563eb",
  layoutType: "classic",
  showPageNumbers: true,
};

export async function loadQuotationPdfContext(
  quotation: QuotationDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
    mode?: QuotationPdfMode;
  },
): Promise<QuotationPdfContext> {
  const [tenantResult, templateResult] = await Promise.allSettled([
    options?.tenant
      ? Promise.resolve(options.tenant)
      : settingsApi.getTenant(),
    options?.template
      ? Promise.resolve(options.template)
      : settingsApi.getPdfTemplate(),
  ]);

  const tenant =
    tenantResult.status === "fulfilled"
      ? tenantResult.value
      : options?.tenant ?? DEFAULT_TENANT;
  const template =
    templateResult.status === "fulfilled"
      ? templateResult.value
      : options?.template ?? DEFAULT_TEMPLATE;

  return {
    quotation,
    tenant,
    template,
    mode: options?.mode ?? "final",
  };
}

export async function generateQuotationPdfBlob(
  ctx: QuotationPdfContext,
): Promise<Blob> {
  return pdf(<QuotationPdfDocument ctx={ctx} />).toBlob();
}

export async function buildQuotationPdfBlob(
  quotation: QuotationDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
    mode?: QuotationPdfMode;
  },
): Promise<Blob> {
  const ctx = await loadQuotationPdfContext(quotation, options);
  return generateQuotationPdfBlob(ctx);
}

export function quotationPdfFileName(number: string) {
  return `devis-${sanitizePdfFileName(number)}.pdf`;
}

export async function downloadQuotationPdf(
  quotation: QuotationDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
  },
) {
  const blob = await buildQuotationPdfBlob(quotation, {
    ...options,
    mode: "final",
  });
  downloadPdfBlob(blob, quotationPdfFileName(quotation.number));
}

export async function createQuotationPreviewUrl(
  quotation: QuotationDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
  },
) {
  const blob = await buildQuotationPdfBlob(quotation, {
    ...options,
    mode: "preview",
  });
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName: quotationPdfFileName(quotation.number),
  };
}
