"use client";

import {
  ErrorState,
  LoadingBlock,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { NumberingRulesEditor } from "../components/NumberingRulesEditor";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useNumberingRules } from "../hooks/useSettings";
import { useSettingsAccess } from "../hooks/useSettingsAccess";

export default function NumberingPage() {
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageSettings } = useSettingsAccess();
  const { numberingQuery, updateMutation } = useNumberingRules();

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Numérotation"
        description="Préfixes, compteurs et format des documents commerciaux."
      />

      {numberingQuery.isPending && !numberingQuery.data && (
        <LoadingBlock label="Chargement des règles..." />
      )}

      {numberingQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger les règles de numérotation."
          onRetry={() => numberingQuery.refetch()}
        />
      )}

      {numberingQuery.data ? (
        <SettingsContentCard>
          <NumberingRulesEditor
            rules={numberingQuery.data}
            canManage={canManageSettings}
            isSubmitting={updateMutation.isPending || isBusy}
            onUpdate={(documentType, values) =>
              updateMutation.mutateAsync({ documentType, payload: values })
            }
          />
        </SettingsContentCard>
      ) : null}
    </div>
  );
}
