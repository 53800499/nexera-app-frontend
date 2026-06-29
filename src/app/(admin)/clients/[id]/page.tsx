import type { Metadata } from "next";
import { ClientDetailsPage } from "@/modules/crm";

export const metadata: Metadata = {
  title: "Fiche client | NEXERA ERP",
  description: "Détail client et historique commercial",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetailsPage id={id} />;
}
