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
import type { OrderDetail } from "../types/order.types";
import { OrderPdfDocument } from "./OrderPdfDocument";
import type { OrderPdfContext, OrderPdfMode } from "./orderPdf.types";

const DEFAULT_TENANT: TenantSettings = {
  primaryCurrency: "EUR",
  exchangeRateSource: "manual",
};

const DEFAULT_TEMPLATE: PdfTemplate = {
  primaryColor: "#2563eb",
  layoutType: "classic",
  showPageNumbers: true,
};

export async function loadOrderPdfContext(
  order: OrderDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
    mode?: OrderPdfMode;
  },
): Promise<OrderPdfContext> {
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
    order,
    tenant,
    template,
    mode: options?.mode ?? "final",
  };
}

export async function generateOrderPdfBlob(
  ctx: OrderPdfContext,
): Promise<Blob> {
  return pdf(<OrderPdfDocument ctx={ctx} />).toBlob();
}

export async function buildOrderPdfBlob(
  order: OrderDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
    mode?: OrderPdfMode;
  },
): Promise<Blob> {
  const ctx = await loadOrderPdfContext(order, options);
  return generateOrderPdfBlob(ctx);
}

export function orderPdfFileName(number: string) {
  return `bc-${sanitizePdfFileName(number)}.pdf`;
}

export async function downloadOrderPdf(
  order: OrderDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
  },
) {
  const blob = await buildOrderPdfBlob(order, {
    ...options,
    mode: "final",
  });
  downloadPdfBlob(blob, orderPdfFileName(order.number));
}

export async function createOrderPreviewUrl(
  order: OrderDetail,
  options?: {
    tenant?: TenantSettings | null;
    template?: PdfTemplate | null;
  },
) {
  const blob = await buildOrderPdfBlob(order, {
    ...options,
    mode: "preview",
  });
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName: orderPdfFileName(order.number),
  };
}
