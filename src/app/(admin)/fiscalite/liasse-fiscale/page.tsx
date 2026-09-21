import type { Metadata } from "next";
import { LiasseFiscaleView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Liasse Fiscale Annuelle SYSCOHADA | NEXERA ERP",
  description:
    "Génération des états financiers Système Normal et SMT, circuit de visa Cabinet d'expertise comptable (M6) et télédéclaration.",
};

export default function Page() {
  return <LiasseFiscaleView />;
}
