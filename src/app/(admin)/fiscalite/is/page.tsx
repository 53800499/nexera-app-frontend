import type { Metadata } from "next";
import { IsCalculView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Impôt sur les Sociétés (IS) & Acomptes | NEXERA ERP",
  description:
    "Calcul de l'IS annuel, retraitements fiscaux extracomptables, minimum de perception et échéancier des acomptes (CGI Art. 46-51).",
};

export default function Page() {
  return <IsCalculView />;
}
