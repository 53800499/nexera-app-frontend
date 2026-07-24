import type { Metadata } from "next";
import InventoryDetailsPage from "@/modules/stock/inventory/pages/InventoryDetailsPage";

export const metadata: Metadata = {
  title: "Détail inventaire | NEXERA ERP",
  description: "Session d'inventaire physique",
};

export default async function InventaireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InventoryDetailsPage sessionId={id} />;
}
