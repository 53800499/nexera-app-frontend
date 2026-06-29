import type { Metadata } from "next";
import { EditCatalogCategoryPage } from "@/modules/catalogue";

export const metadata: Metadata = {
  title: "Modifier la catégorie | NEXERA ERP",
  description: "Modifier une catégorie du catalogue",
};

export default async function ModifierCategoriePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCatalogCategoryPage id={id} />;
}
