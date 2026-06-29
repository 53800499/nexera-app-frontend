import { settingsApi } from "@/modules/parametres/services/settingsApi.service";

export const paymentTermsApi = {
  list: () => settingsApi.listPaymentTerms(),
};
