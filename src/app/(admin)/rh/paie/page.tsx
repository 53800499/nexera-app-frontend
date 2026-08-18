import type { Metadata } from "next";
import { CyclesPaieListPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Cycles de Paie | NEXERA ERP",
  description: "Cycles de paie mensuels, calcul 1-clic, primes et bulletins conformes Bénin CGI 2026",
};

export default function PaieRoutePage() {
  return <CyclesPaieListPage />;
}
