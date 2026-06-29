import type { Metadata } from "next";
import { OrderDetailsPage } from "@/modules/commandes";

export const metadata: Metadata = {
  title: "Détail commande | NEXERA ERP",
  description: "Consultation et actions sur un bon de commande",
};

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailsPage id={id} />;
}
