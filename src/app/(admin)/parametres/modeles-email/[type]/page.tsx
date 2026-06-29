import type { Metadata } from "next";
import { EmailTemplateEditPage } from "@/modules/parametres";
import type { EmailTemplateType } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Modèle email | Paramètres | NEXERA ERP",
};

type Props = {
  params: Promise<{ type: string }>;
};

const VALID_TYPES: EmailTemplateType[] = [
  "quotation_send",
  "invoice_send",
  "reminder_level_1",
  "reminder_level_2",
  "reminder_level_3",
  "recurring_invoice",
];

export default async function Page({ params }: Props) {
  const { type } = await params;
  const templateType = VALID_TYPES.includes(type as EmailTemplateType)
    ? (type as EmailTemplateType)
    : "quotation_send";

  return <EmailTemplateEditPage type={templateType} />;
}
