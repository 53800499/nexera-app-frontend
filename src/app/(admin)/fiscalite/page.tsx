import type { Metadata } from "next";
import { FiscaliteDashboardView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Fiscalité & Déclarations Réparées (M7) | NEXERA ERP",
  description:
    "Module Fiscalité transversale : TVA, IS, AIB, Patente, Liasses fiscales et export FEC homologué Arrêté 1085-C Bénin.",
};

export default function Page() {
  return <FiscaliteDashboardView />;
}
