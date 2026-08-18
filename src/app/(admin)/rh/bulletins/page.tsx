import type { Metadata } from "next";
import { BulletinsListPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Bulletins de Paie OHADA | NEXERA ERP",
  description: "Consultation, téléchargement et impression des fiches de paie conformes Bénin CGI 2026",
};

export default function BulletinsRoutePage() {
  return <BulletinsListPage />;
}
