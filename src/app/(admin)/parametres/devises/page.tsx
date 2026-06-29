import type { Metadata } from "next";
import { CurrenciesPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Devises | Paramètres | NEXERA ERP",
};

export default function Page() {
  return <CurrenciesPage />;
}
