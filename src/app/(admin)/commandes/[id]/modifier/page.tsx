import type { Metadata } from "next";
import { EditOrderPage } from "@/modules/commandes";

export const metadata: Metadata = {
  title: "Modifier BC | NEXERA ERP",
  description: "Modification d'un bon de commande",
};

export default async function CommandeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditOrderPage id={id} />;
}
