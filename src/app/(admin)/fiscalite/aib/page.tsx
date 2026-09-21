import type { Metadata } from "next";
import { AibView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "AIB & Retenues à la Source | NEXERA ERP",
  description:
    "Suivi de l'Acompte sur Impôt assis sur les Bénéfices (AIB 1% et 5%), simulateur et récapitulatif annuel imputable sur l'IS.",
};

export default function Page() {
  return <AibView />;
}
