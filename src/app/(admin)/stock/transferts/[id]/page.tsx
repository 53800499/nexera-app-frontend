import type { Metadata } from "next";
import { StockTransferDetailsPage } from "@/modules/stock";

export const metadata: Metadata = {
  title: "Détail transfert | NEXERA ERP",
  description: "Détail d’un transfert inter-entrepôts",
};

export default async function TransfertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StockTransferDetailsPage transferId={id} />;
}
