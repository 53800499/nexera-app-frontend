import type { Metadata } from "next";
import { NumberingPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Numérotation | Paramètres | NEXERA ERP",
};

export default function Page() {
  return <NumberingPage />;
}
