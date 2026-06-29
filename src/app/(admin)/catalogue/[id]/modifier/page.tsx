import type { Metadata } from "next";
import { EditCatalogItemPage } from "@/modules/catalogue";

export const metadata: Metadata = {
  title: "Modifier l'article | NEXERA ERP",
  description: "Modifier un article du catalogue",
};

export default async function ModifierCataloguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCatalogItemPage id={id} />;
}
