import ForgotPasswordForm from "@/modules/auth/components/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié | NEXERA ERP",
  description: "Demandez un lien de réinitialisation de votre mot de passe NEXERA",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
