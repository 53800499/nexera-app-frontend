import type { Metadata } from "next";
import { TaxRatesPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Taux de TVA | Paramètres | NEXERA ERP",
};

export default function Page() {
  return <TaxRatesPage />;
}
