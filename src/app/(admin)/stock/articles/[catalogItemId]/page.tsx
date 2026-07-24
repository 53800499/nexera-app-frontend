import type { Metadata } from "next";
import { StockArticleConfigPage } from "@/modules/stock/articles";

export const metadata: Metadata = {
  title: "Configuration stock | NEXERA ERP",
  description: "Configurer le stock d'un article",
};

export default async function StockArticlePage({
  params,
}: {
  params: Promise<{ catalogItemId: string }>;
}) {
  const { catalogItemId } = await params;
  return <StockArticleConfigPage catalogItemId={catalogItemId} />;
}
