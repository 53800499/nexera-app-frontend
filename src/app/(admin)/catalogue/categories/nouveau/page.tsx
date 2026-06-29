import type { Metadata } from "next";
import { CreateCatalogCategoryPage } from "@/modules/catalogue";

export const metadata: Metadata = {
  title: "Nouvelle catégorie | NEXERA ERP",
  description: "Création d'une catégorie du catalogue",
};

export default function NouvelleCategoriePage() {
  return <CreateCatalogCategoryPage />;
}
