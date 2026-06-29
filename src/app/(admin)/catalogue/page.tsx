import type { Metadata } from "next";
import { CatalogueListPage } from "@/modules/catalogue";

export const metadata: Metadata = {
  title: "Catalogue | NEXERA ERP",
  description: "Articles, services et catégories du catalogue commercial",
};

export default function CataloguePage() {
  return <CatalogueListPage />;
}
