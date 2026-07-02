import type { PdfTemplate, TenantSettings } from "@/modules/parametres/types/settings.types";
import type { QuotationDetail } from "../types/quotation.types";

export type QuotationPdfMode = "final" | "preview";

export type QuotationPdfContext = {
  quotation: QuotationDetail;
  tenant: TenantSettings;
  template: PdfTemplate;
  mode: QuotationPdfMode;
};
