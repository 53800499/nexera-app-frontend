import type { Metadata } from "next";
import { RemindersHistoryPage } from "@/modules/relances";

export const metadata: Metadata = {
  title: "Historique relances | NEXERA ERP",
  description: "Historique des relances automatiques et manuelles",
};

export default async function RelancesHistoriquePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; invoiceId?: string }>;
}) {
  const { clientId, invoiceId } = await searchParams;
  return (
    <RemindersHistoryPage
      defaultClientId={clientId}
      defaultInvoiceId={invoiceId}
    />
  );
}
