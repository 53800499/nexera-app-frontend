import type { Metadata } from "next";
import { DossierDetailPage } from "@/modules/cabinet";

export const metadata: Metadata = {
  title: "Dossier client | NEXERA Cabinet",
  description: "Consultation des factures d'un dossier client",
};

type Props = {
  params: Promise<{ companyTenantId: string }>;
};

export default async function CabinetDossierDetailPage({ params }: Props) {
  const { companyTenantId } = await params;
  return <DossierDetailPage companyTenantId={companyTenantId} />;
}
