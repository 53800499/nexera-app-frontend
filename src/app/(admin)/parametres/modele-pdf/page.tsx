import type { Metadata } from "next";
import { PdfTemplatePage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Modèle PDF | Paramètres | NEXERA ERP",
};

export default function Page() {
  return <PdfTemplatePage />;
}
