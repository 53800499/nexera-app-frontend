import type {
  PdfTemplate,
  TenantSettings,
} from "@/modules/parametres/types/settings.types";
import type { PaymentDetail } from "../types/payment.types";

export type PaymentPdfMode = "final" | "preview";

export type PaymentPdfContext = {
  payment: PaymentDetail;
  tenant: TenantSettings;
  template: PdfTemplate;
  mode: PaymentPdfMode;
};
