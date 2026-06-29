import type { ClientDetail } from "../types/client.types";
import { parseAddress, type ClientEditFormValues } from "../schemas/clientForm.schema";
import { DEFAULT_CURRENCY, isCurrencyCode } from "@/shared/constants/currencies";

export function clientToEditValues(client: ClientDetail): ClientEditFormValues {
  const shipping = client.shippingAddress
    ? parseAddress(client.shippingAddress)
    : undefined;
  const hasShipping = Boolean(
    shipping &&
      (shipping.street || shipping.city || shipping.postalCode || shipping.country),
  );

  const currency = client.defaultCurrency ?? "";

  return {
    clientType: client.clientType,
    companyName: client.companyName,
    tradeName: client.tradeName ?? "",
    siret: client.siret ?? "",
    taxId: client.taxId ?? "",
    sector: client.sector ?? "",
    billingAddress: parseAddress(client.billingAddress),
    useShippingAddress: hasShipping,
    shippingAddress: hasShipping ? shipping : undefined,
    defaultCurrency: isCurrencyCode(currency) ? currency : DEFAULT_CURRENCY,
    defaultDiscountPct: client.defaultDiscountPct ?? 0,
    creditLimit: client.creditLimit ?? undefined,
    notes: client.notes ?? "",
    remindersDisabled: client.remindersDisabled ?? false,
    remindersDisabledReason: client.remindersDisabledReason ?? "",
  };
}
