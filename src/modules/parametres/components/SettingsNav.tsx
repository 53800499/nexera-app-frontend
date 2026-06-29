"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  BoxCubeIcon,
  CalenderIcon,
  DollarLineIcon,
  GridIcon,
  ListIcon,
  MailIcon,
  PageIcon,
  PieChartIcon,
} from "@/icons";
import {
  getSettingsSectionsByGroupForWorkspace,
  getSettingsSectionsForWorkspace,
  SETTINGS_SECTIONS,
} from "../utils/settingsLabels";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";

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

function isActivePath(pathname: string, href: string) {
  if (href === "/parametres") return pathname === "/parametres";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  compact = false,
}: {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-white/90"
      } ${compact ? "shrink-0 whitespace-nowrap" : ""}`}
    >
      {Icon ? (
        <Icon
          className={`h-5 w-5 shrink-0 ${
            isActive ? "text-brand-500" : "text-gray-400"
          }`}
        />
      ) : null}
      <span>{label}</span>
    </Link>
  );
}

export function SettingsNav() {
  const pathname = usePathname();
  const user = useAuthUser();
  const groups = getSettingsSectionsByGroupForWorkspace(user?.workspace);
  const visibleSections = getSettingsSectionsForWorkspace(user?.workspace);
  const isOverview = pathname === "/parametres";

  return (
    <>
      <nav
        aria-label="Navigation paramètres"
        className="hidden lg:block lg:sticky lg:top-24"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <NavLink
            href="/parametres"
            label="Vue d'ensemble"
            icon={GridIcon}
            isActive={isOverview}
          />

          <div className="mt-4 space-y-4">
            {groups.map((group) => (
              <div key={group.id}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.sections.map((section) => {
                    const Icon = SECTION_ICONS[section.href];
                    return (
                      <NavLink
                        key={`${section.href}-${section.title}`}
                        href={section.href}
                        label={section.title}
                        icon={Icon}
                        isActive={isActivePath(pathname, section.href)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <nav
        aria-label="Navigation paramètres mobile"
        className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
      >
        <NavLink
          href="/parametres"
          label="Vue d'ensemble"
          isActive={isOverview}
          compact
        />
        {visibleSections.map((section) => (
          <NavLink
            key={`${section.href}-${section.title}`}
            href={section.href}
            label={section.title}
            isActive={isActivePath(pathname, section.href)}
            compact
          />
        ))}
      </nav>
    </>
  );
}
