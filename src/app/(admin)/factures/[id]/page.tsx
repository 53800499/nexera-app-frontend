import type { Metadata } from "next";
import { InvoiceDetailsPage } from "@/modules/factures";

export const metadata: Metadata = {
  title: "Détail facture | NEXERA ERP",
  description: "Consultation et actions sur une facture",
};

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetailsPage id={id} />;
}
