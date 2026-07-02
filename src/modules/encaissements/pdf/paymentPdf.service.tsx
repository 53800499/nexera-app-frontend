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
import type { PaymentDetail } from "../types/payment.types";
import { PaymentPdfDocument } from "./PaymentPdfDocument";
import type { PaymentPdfContext, PaymentPdfMode } from "./paymentPdf.types";

const DEFAULT_TENANT: TenantSettings = {
  primaryCurrency: "EUR",
  exchangeRateSource: "manual",
};

const DEFAULT_TEMPLATE: PdfTemplate = {
  primaryColor: "#2563eb",
  layoutType: "classic",
  showPageNumbers: true,
};

export async function loadPaymentPdfContext(
  payment: PaymentDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
    mode?: PaymentPdfMode;
  },
): Promise<PaymentPdfContext> {
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
    payment,
    tenant,
    template,
    mode: options?.mode ?? "final",
  };
}

export async function generatePaymentPdfBlob(
  ctx: PaymentPdfContext,
): Promise<Blob> {
  return pdf(<PaymentPdfDocument ctx={ctx} />).toBlob();
}

export async function buildPaymentPdfBlob(
  payment: PaymentDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
    mode?: PaymentPdfMode;
  },
): Promise<Blob> {
  const ctx = await loadPaymentPdfContext(payment, options);
  return generatePaymentPdfBlob(ctx);
}

export function paymentPdfFileName(payment: PaymentDetail) {
  const slug = payment.reference?.trim()
    ? sanitizePdfFileName(payment.reference)
    : payment.id.slice(0, 8);
  return `encaissement-${slug}.pdf`;
}

export async function downloadPaymentPdf(
  payment: PaymentDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
  },
) {
  const blob = await buildPaymentPdfBlob(payment, {
    ...options,
    mode: "final",
  });
  downloadPdfBlob(blob, paymentPdfFileName(payment));
}

export async function createPaymentPreviewUrl(
  payment: PaymentDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
  },
) {
  const blob = await buildPaymentPdfBlob(payment, {
    ...options,
    mode: "preview",
  });
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName: paymentPdfFileName(payment),
  };
}
