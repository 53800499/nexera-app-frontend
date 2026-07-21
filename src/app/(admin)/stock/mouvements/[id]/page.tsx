import type { Metadata } from "next";
import { StockMovementDetailsPage } from "@/modules/stock";

export const metadata: Metadata = {
  title: "Détail mouvement | NEXERA ERP",
  description: "Détail d'un mouvement de stock",
};

export default async function MouvementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StockMovementDetailsPage id={id} />;
}
