import type { Metadata } from "next";
import { ParametresNdfPage } from "@/modules/notes-frais";

export const metadata: Metadata = {
  title: "Paramètres & Barèmes Fiscaux (Notes de Frais) | NEXERA ERP",
  description: "Barèmes kilométriques et per diem Bénin 2026, plafonds et politiques",
};

export default function Page() {
  return <ParametresNdfPage />;
}
