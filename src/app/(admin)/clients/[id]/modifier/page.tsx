import type { Metadata } from "next";
import { EditClientPage } from "@/modules/crm";

export const metadata: Metadata = {
  title: "Modifier le client | NEXERA ERP",
  description: "Modifier une fiche client",
};

export default async function ModifierClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditClientPage id={id} />;
}
