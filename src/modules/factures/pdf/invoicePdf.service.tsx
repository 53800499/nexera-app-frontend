import { pdf } from "@react-pdf/renderer";
import type {
  PdfTemplate,
  TenantSettings,
} from "@/modules/parametres/types/settings.types";
import { settingsApi } from "@/modules/parametres/services/settingsApi.service";
import { sanitizePdfFileName } from "@/modules/devis/pdf/quotationPdfFormat";
import {
  createPdfPreviewUrl,
  downloadPdfBlob,
} from "@/shared/pdf/pdfBlob";
import type { InvoiceDetail } from "../types/invoice.types";
import { InvoicePdfDocument } from "./InvoicePdfDocument";
import type { InvoicePdfContext, InvoicePdfMode } from "./invoicePdf.types";

const DEFAULT_TENANT: TenantSettings = {
  primaryCurrency: "EUR",
  exchangeRateSource: "manual",
};

const DEFAULT_TEMPLATE: PdfTemplate = {
  primaryColor: "#2563eb",
  layoutType: "classic",
  showPageNumbers: true,
};

export async function loadInvoicePdfContext(
  invoice: InvoiceDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
    mode?: InvoicePdfMode;
  },
): Promise<InvoicePdfContext> {
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
    invoice,
    tenant,
    template,
    mode: options?.mode ?? "final",
  };
}

export async function generateInvoicePdfBlob(
  ctx: InvoicePdfContext,
): Promise<Blob> {
  return pdf(<InvoicePdfDocument ctx={ctx} />).toBlob();
}

export async function buildInvoicePdfBlob(
  invoice: InvoiceDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
    mode?: InvoicePdfMode;
  },
): Promise<Blob> {
  const ctx = await loadInvoicePdfContext(invoice, options);
  return generateInvoicePdfBlob(ctx);
}

export function invoicePdfFileName(number: string) {
  return `facture-${sanitizePdfFileName(number)}.pdf`;
}

export async function downloadInvoicePdf(
  invoice: InvoiceDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
  },
) {
  const blob = await buildInvoicePdfBlob(invoice, {
    ...options,
    mode: "final",
  });
  downloadPdfBlob(blob, invoicePdfFileName(invoice.number));
}

export async function createInvoicePreviewUrl(
  invoice: InvoiceDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
  },
) {
  const blob = await buildInvoicePdfBlob(invoice, {
    ...options,
    mode: "preview",
  });
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName: invoicePdfFileName(invoice.number),
  };
}
