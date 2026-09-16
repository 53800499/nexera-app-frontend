import type { Metadata } from "next";
import { MecefSettingsPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Facturation e-MECeF | Paramètres | NEXERA ERP",
  description: "Configuration de la normalisation fiscale DGI Bénin (e-MECeF)",
};

export default function Page() {
  return <MecefSettingsPage />;
}
