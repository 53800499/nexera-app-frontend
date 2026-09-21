import type { Metadata } from "next";
import { CalendrierFiscalView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Calendrier Fiscal & Échéances | NEXERA ERP",
  description:
    "Échéancier consolidé des impôts directs, indirects et déclarations sociales, alertes J-30/J-15/J-7/J-3 et suivi des règlements.",
};

export default function Page() {
  return <CalendrierFiscalView />;
}
