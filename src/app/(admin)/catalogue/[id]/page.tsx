import type { Metadata } from "next";
import { CatalogItemDetailsPage } from "@/modules/catalogue";

export const metadata: Metadata = {
  title: "Fiche article | NEXERA ERP",
  description: "Détail d'un article du catalogue",
};

export default async function CatalogueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CatalogItemDetailsPage id={id} />;
}
