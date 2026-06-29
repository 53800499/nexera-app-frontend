import type { Metadata } from "next";
import { PaymentDetailsPage } from "@/modules/encaissements";

export const metadata: Metadata = {
  title: "Détail encaissement | NEXERA ERP",
  description: "Consultation d'un paiement client",
};

export default async function EncaissementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentDetailsPage id={id} />;
}
