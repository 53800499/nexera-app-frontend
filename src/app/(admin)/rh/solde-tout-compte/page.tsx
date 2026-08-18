import type { Metadata } from "next";
import { SoldeToutComptePage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Solde de Tout Compte | NEXERA ERP",
  description: "Règlements de fin de contrat et reçus pour solde de tout compte",
};

export default function SoldeToutCompteRoutePage() {
  return <SoldeToutComptePage />;
}
