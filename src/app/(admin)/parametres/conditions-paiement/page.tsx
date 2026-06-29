import type { Metadata } from "next";
import { PaymentTermsSettingsPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Conditions de paiement | Paramètres | NEXERA ERP",
};

export default function Page() {
  return <PaymentTermsSettingsPage />;
}
