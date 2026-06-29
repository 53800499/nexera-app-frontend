import type { Metadata } from "next";
import { EditQuotationPage } from "@/modules/devis";

export const metadata: Metadata = {
  title: "Modifier devis | NEXERA ERP",
  description: "Modification d'un devis commercial",
};

export default async function ModifierDevisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditQuotationPage id={id} />;
}
