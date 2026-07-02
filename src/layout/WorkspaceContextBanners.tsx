"use client";

import Link from "next/link";
import { getUserDisplayName } from "@/modules/auth";
import { WORKSPACE_LABELS } from "@/modules/auth/constants/roles";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { USER_ROLES, WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import { useCabinetDossierContext } from "@/modules/cabinet/hooks/useCabinetDossierContext";
import { CABINET_ROUTES } from "@/modules/cabinet/constants/routes";

function ReadOnlyBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-400/25 px-3 py-1 text-xs font-semibold text-amber-50"
      role="status"
      aria-label="Mode lecture seule — droits limités"
    >
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
          clipRule="evenodd"
        />
      </svg>
      Mode lecture seule — droits limités
    </span>
  );
}

export function WorkspaceContextBanners() {
  const user = useAuthStore((state) => state.user);
  const isCabinetWorkspace = user?.workspace === WORKSPACE_TYPES.CABINET;
  const isReadOnly = user?.role === USER_ROLES.COLLABORATEUR_CABINET;
  const displayName = user ? getUserDisplayName(user) : "";
  const consultantLabel =
    user?.role === USER_ROLES.EXPERT_COMPTABLE ? "Expert" : "Collaborateur";
  const { isInDossier, companyName, isLoading } = useCabinetDossierContext();

  if (!user) {
    return null;
  }

  return (
    <>
      {isCabinetWorkspace ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-2 bg-[var(--color-nexera-cabinet)] px-4 py-2 text-xs text-white/95">
          <span className="font-medium">
            {WORKSPACE_LABELS.cabinet} - {displayName}
          </span>
          {isReadOnly ? <ReadOnlyBadge /> : null}
        </div>
      ) : (
        <div className="flex w-full items-center gap-2 bg-[var(--color-nexera-primary)] px-4 py-2 text-xs font-medium text-white/95">
          <span>
            {WORKSPACE_LABELS.entreprise} - {displayName}
          </span>
        </div>
      )}

      {isCabinetWorkspace && isInDossier ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-2 border-b border-cabinet-800 bg-cabinet-700 px-4 py-2.5 text-sm text-white/95">
          <p className="min-w-0">
            <span className="text-white/75">Vous consultez le dossier :</span>{" "}
            <span className="font-semibold">
              {isLoading ? "Chargement…" : (companyName ?? "Dossier client")}
            </span>
            <span className="text-white/60"> — </span>
            <span className="text-white/75">{consultantLabel} :</span>{" "}
            <span className="font-medium">{displayName}</span>
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isReadOnly ? <ReadOnlyBadge /> : null}
            <Link
              href={CABINET_ROUTES.dossiers}
              className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium hover:bg-white/20"
            >
              Tous les dossiers
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
