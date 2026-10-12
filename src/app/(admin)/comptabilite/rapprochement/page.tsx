import type { Metadata } from "next";
import { RapprochementBancaireView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Rapprochement Bancaire | NEXERA ERP",
  description: "Import de relevés bancaires (CSV, OFX) et rapprochement assisté avec les écritures du compte 521 (UC-11).",
};

export default function RapprochementPage() {
  return <RapprochementBancaireView />;
}
