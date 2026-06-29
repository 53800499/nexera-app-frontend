import type { Metadata } from "next";
import { CreateCatalogPricePage } from "@/modules/catalogue";

export const metadata: Metadata = {
  title: "Nouveau tarif | NEXERA ERP",
  description: "Ajouter un tarif spécifique à un article",
};

export default async function NouveauTarifPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CreateCatalogPricePage itemId={id} />;
}
