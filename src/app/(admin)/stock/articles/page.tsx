import type { Metadata } from "next";
import { StockArticlesListPage } from "@/modules/stock";

export const metadata: Metadata = {
  title: "Articles stock | NEXERA ERP",
  description: "Configuration stock des articles catalogue",
};

export default function StockArticlesPage() {
  return <StockArticlesListPage />;
}
