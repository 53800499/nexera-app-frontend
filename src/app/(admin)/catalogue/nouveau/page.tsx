import type { Metadata } from "next";
import { CreateCatalogItemPage } from "@/modules/catalogue";

export const metadata: Metadata = {
  title: "Nouvel article | NEXERA ERP",
  description: "Création d'un article ou service du catalogue",
};

export default function CatalogueNouveauPage() {
  return <CreateCatalogItemPage />;
}
