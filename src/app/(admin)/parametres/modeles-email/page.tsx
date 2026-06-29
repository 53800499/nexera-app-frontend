import type { Metadata } from "next";
import { EmailTemplatesPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Modèles email | Paramètres | NEXERA ERP",
};

export default function Page() {
  return <EmailTemplatesPage />;
}
