"use client";

import {
  ErrorState,
  LoadingBlock,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { PaymentTermsManager } from "../components/PaymentTermsManager";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import { usePaymentTermsManagement } from "../hooks/useSettings";

export default function PaymentTermsSettingsPage() {
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageSettings } = useSettingsAccess();
  const { paymentTermsQuery, createMutation, updateMutation, deleteMutation } =
    usePaymentTermsManagement();

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isBusy;

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Conditions de paiement"
        description="Délais et échéances proposés sur les devis et factures."
      />

      {paymentTermsQuery.isPending && !paymentTermsQuery.data && (
        <LoadingBlock label="Chargement des conditions..." />
      )}

      {paymentTermsQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger les conditions de paiement."
          onRetry={() => paymentTermsQuery.refetch()}
        />
      )}

      {paymentTermsQuery.data ? (
        <SettingsContentCard>
          <PaymentTermsManager
            paymentTerms={paymentTermsQuery.data}
            canManage={canManageSettings}
            isSubmitting={isSubmitting}
            onCreate={(values) => createMutation.mutateAsync(values)}
            onUpdate={(id, values) =>
              updateMutation.mutateAsync({ id, payload: values })
            }
            onDelete={(id) => deleteMutation.mutateAsync(id)}
          />
        </SettingsContentCard>
      ) : null}
    </div>
  );
}
