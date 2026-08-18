import type { Metadata } from "next";
import { CyclePaieDetailsPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Détail Cycle de Paie | NEXERA ERP",
  description: "Calcul de la paie, bulletins des salariés, variables du mois et écriture comptable OD",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CycleDetailRoutePage({ params }: Props) {
  const { id } = await params;
  return <CyclePaieDetailsPage cycleId={id} />;
}
