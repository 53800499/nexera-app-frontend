import type { PdfTemplate, TenantSettings } from "@/modules/parametres/types/settings.types";
import type { InvoiceDetail } from "../types/invoice.types";

export type InvoicePdfMode = "final" | "preview";

export type InvoicePdfContext = {
  invoice: InvoiceDetail;
  tenant: TenantSettings;
  template: PdfTemplate;
  mode: InvoicePdfMode;
};
