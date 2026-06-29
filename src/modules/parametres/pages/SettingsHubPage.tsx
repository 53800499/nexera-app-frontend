"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  BellIcon,
  BoxCubeIcon,
  CalenderIcon,
  DollarLineIcon,
  ListIcon,
  MailIcon,
  PageIcon,
  PieChartIcon,
} from "@/icons";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  getSettingsSectionsByGroupForWorkspace,
  type SettingsSection,
} from "../utils/settingsLabels";

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/parametres/entreprise": BoxCubeIcon,
  "/parametres/cabinet": BoxCubeIcon,
  "/parametres/taxes": PieChartIcon,
  "/parametres/conditions-paiement": CalenderIcon,
  "/parametres/devises": DollarLineIcon,
  "/parametres/numerotation": ListIcon,
  "/parametres/modele-pdf": PageIcon,
  "/parametres/modeles-email": MailIcon,
  "/parametres/relances": BellIcon,
};

function SettingsHubCard({ section }: { section: SettingsSection }) {
  const Icon = SECTION_ICONS[section.href] ?? BoxCubeIcon;

  return (
    <Link
      href={section.href}
      className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:group-hover:bg-brand-500/20">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-gray-800 dark:text-white/90">
            {section.title}
          </h3>
          <ArrowRightIcon className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          {section.description}
        </p>
      </div>
    </Link>
  );
}

export default function SettingsHubPage() {
  const { canManageSettings } = useSettingsAccess();
  const user = useAuthUser();
  const groups = getSettingsSectionsByGroupForWorkspace(user?.workspace);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-white/90">
            Paramètres
          </h1>
          {canManageSettings ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              Modification
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Lecture seule
            </span>
          )}
        </div>
        <p className="max-w-2xl text-sm text-gray-500">
          Configurez votre entreprise, la facturation, les documents commerciaux
          et les communications automatiques.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white p-5 dark:border-brand-500/20 dark:from-brand-500/5 dark:to-gray-900">
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
          Conseil
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Commencez par renseigner les informations{" "}
          <Link
            href="/parametres/entreprise"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Entreprise
          </Link>
          , puis configurez la TVA et la numérotation avant d&apos;émettre vos
          premiers documents.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.id} className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {group.label}
          </h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {group.sections.map((section) => (
              <SettingsHubCard key={section.href} section={section} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
