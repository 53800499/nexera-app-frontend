import type { Metadata } from "next";
import { ContratsListPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Contrats & Carrières | NEXERA ERP",
  description: "Gestion des contrats de travail (CDI, CDD, Stage), périodes d'essai et simulateur d'indemnités",
};

export default function ContratsRoutePage() {
  return <ContratsListPage />;
}
