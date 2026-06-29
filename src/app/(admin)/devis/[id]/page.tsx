import type { Metadata } from "next";
import { QuotationDetailsPage } from "@/modules/devis";

export const metadata: Metadata = {
  title: "Détail devis | NEXERA ERP",
  description: "Consultation et actions sur un devis",
};

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuotationDetailsPage id={id} />;
}
