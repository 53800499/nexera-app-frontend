import SignInForm from "@/modules/auth/components/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | NEXERA ERP",
  description: "Connectez-vous à votre espace NEXERA ERP",
};

export default function SignInPage() {
  return <SignInForm />;
}
