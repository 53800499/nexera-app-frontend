import ResetPasswordForm from "@/modules/auth/components/ResetPasswordForm";
import { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock } from "@/shared/components/feedback";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | NEXERA ERP",
  description: "Définissez un nouveau mot de passe pour votre compte NEXERA",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
          <LoadingBlock label="Chargement..." minHeight="min-h-[50vh]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
