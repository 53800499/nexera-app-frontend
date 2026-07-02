import type { PdfTemplate, TenantSettings } from "@/modules/parametres/types/settings.types";
import type { OrderDetail } from "../types/order.types";

export type OrderPdfMode = "final" | "preview";

export type OrderPdfContext = {
  order: OrderDetail;
  tenant: TenantSettings;
  template: PdfTemplate;
  mode: OrderPdfMode;
};
