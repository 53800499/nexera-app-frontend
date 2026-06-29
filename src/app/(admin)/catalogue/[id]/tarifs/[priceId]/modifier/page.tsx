import type { Metadata } from "next";
import { EditCatalogPricePage } from "@/modules/catalogue";

export const metadata: Metadata = {
  title: "Modifier le tarif | NEXERA ERP",
  description: "Modifier un tarif spécifique d'un article",
};

export default async function ModifierTarifPage({
  params,
}: {
  params: Promise<{ id: string; priceId: string }>;
}) {
  const { id, priceId } = await params;
  return <EditCatalogPricePage itemId={id} priceId={priceId} />;
}
