import type { Metadata } from "next";
import { EditInvoicePage } from "@/modules/factures";

export const metadata: Metadata = {
  title: "Modifier facture | NEXERA ERP",
  description: "Modification d'une facture en brouillon",
};

export default async function FactureEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditInvoicePage id={id} />;
}
