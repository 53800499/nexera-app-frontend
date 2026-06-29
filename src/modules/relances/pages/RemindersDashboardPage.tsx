"use client";

import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { RequireReminderAccess } from "../components/RequireReminderAccess";
import { ReminderSettingsForm } from "../components/ReminderSettingsForm";
import { PaymentBehaviorPanel } from "../components/PaymentBehaviorPanel";
import { RemindersTable } from "../components/RemindersTable";
import { useReminderAccess } from "../hooks/useReminderAccess";
import { useReminderSettings, useReminders } from "../hooks/useReminders";
import type { ReminderSettingsFormValues } from "../schemas/reminderForm.schema";

export default function RemindersDashboardPage() {
  const toast = useToast();
  const { canManageReminders } = useReminderAccess();
  const { settingsQuery, updateSettingsMutation } = useReminderSettings();
  const { remindersQuery, processMutation } = useReminders({ page: 1, limit: 10 });

  const handleSettingsSubmit = async (values: ReminderSettingsFormValues) => {
    await updateSettingsMutation.mutateAsync({
      isEnabled: values.isEnabled,
      level1DaysAfterDue: values.level1DaysAfterDue,
      level2DaysAfterDue: values.level2DaysAfterDue,
      level3DaysAfterDue: values.level3DaysAfterDue,
      level2CopyCommercial: values.level2CopyCommercial,
      level3AlertDirector: values.level3AlertDirector,
      level3BlockNewOrders: values.level3BlockNewOrders,
      ...(values.commercialEmail?.trim()
        ? { commercialEmail: values.commercialEmail.trim() }
        : {}),
      ...(values.directorEmail?.trim()
        ? { directorEmail: values.directorEmail.trim() }
        : {}),
    });
  };

  const runAutomatic = async () => {
    try {
      const result = await processMutation.mutateAsync();
      toast.success(
        "Relances traitées",
        `${result.sent} envoyée(s), ${result.skipped} ignorée(s), ${result.blocked} bloquée(s)`,
      );
      await remindersQuery.refetch();
    } catch (error) {
      toast.error(
        "Traitement impossible",
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  return (
    <RequireReminderAccess>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Relances
            </h1>
            <p className="text-sm text-gray-500">
              Configuration des relances automatiques et suivi des envois (UC-07).
            </p>
          </div>
          <Link
            href="/relances/historique"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Historique complet
          </Link>
        </div>

        {settingsQuery.isPending && !settingsQuery.data && (
          <LoadingBlock label="Chargement des paramètres..." />
        )}

        {settingsQuery.isError && (
          <ErrorState
            title="Paramètres indisponibles"
            message="Impossible de charger la configuration des relances."
            onRetry={() => settingsQuery.refetch()}
          />
        )}

        {settingsQuery.data ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-medium">Paramètres de relance</h2>
              {canManageReminders ? (
                <button
                  type="button"
                  disabled={processMutation.isPending}
                  onClick={() => void runAutomatic()}
                  className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-60 dark:border-brand-500/40 dark:text-brand-400"
                >
                  {processMutation.isPending
                    ? "Traitement..."
                    : "Déclencher les relances auto"}
                </button>
              ) : null}
            </div>
            {canManageReminders ? (
              <ReminderSettingsForm
                settings={settingsQuery.data}
                isSubmitting={updateSettingsMutation.isPending}
                onSubmit={handleSettingsSubmit}
              />
            ) : (
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-gray-500">Automatiques</dt>
                  <dd>{settingsQuery.data.isEnabled ? "Activées" : "Désactivées"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Niveau 1</dt>
                  <dd>J+{settingsQuery.data.level1DaysAfterDue}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Niveau 2</dt>
                  <dd>J+{settingsQuery.data.level2DaysAfterDue}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Niveau 3</dt>
                  <dd>J+{settingsQuery.data.level3DaysAfterDue}</dd>
                </div>
              </dl>
            )}
          </div>
        ) : null}

        <PaymentBehaviorPanel />

        <section className="space-y-3">
          <h2 className="font-medium">Dernières relances</h2>
          {remindersQuery.isPending && !remindersQuery.data && (
            <LoadingBlock label="Chargement des relances..." />
          )}
          {remindersQuery.isError && (
            <ErrorState
              title="Échec du chargement"
              message="Impossible de charger les relances récentes."
              onRetry={() => remindersQuery.refetch()}
            />
          )}
          {remindersQuery.data ? (
            <RemindersTable reminders={remindersQuery.data.items} />
          ) : null}
        </section>
      </div>
    </RequireReminderAccess>
  );
}
