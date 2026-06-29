"use client";

import { WORKSPACE_LABELS } from "@/modules/auth/constants/roles";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import { cn } from "@/lib/utils";
import { CONTEXT_TAGLINE } from "./brandIdentity";
import { NexeraMark } from "./NexeraMark";

export type NexeraLogoWorkspace = "cabinet" | "entreprise" | "neutral";

type NexeraLogoProps = {
  variant?: "full" | "compact" | "auth";
  workspace?: NexeraLogoWorkspace;
  showContext?: boolean;
  className?: string;
};

export { CONTEXT_TAGLINE };

function resolveWorkspace(
  override: NexeraLogoWorkspace | undefined,
  userWorkspace: string | undefined,
): NexeraLogoWorkspace {
  if (override) {
    return override;
  }
  if (userWorkspace === WORKSPACE_TYPES.CABINET) {
    return "cabinet";
  }
  if (userWorkspace === WORKSPACE_TYPES.ENTREPRISE) {
    return "entreprise";
  }
  return "neutral";
}

function contextLabel(workspace: NexeraLogoWorkspace): string | null {
  if (workspace === "cabinet") {
    return WORKSPACE_LABELS.cabinet;
  }
  if (workspace === "entreprise") {
    return WORKSPACE_LABELS.entreprise;
  }
  return null;
}

function markTintClass(workspace: NexeraLogoWorkspace, onBrand: boolean) {
  if (onBrand) {
    return "";
  }
  if (workspace === "cabinet") {
    return "text-cabinet-500";
  }
  return "text-[var(--color-nexera-primary)]";
}

function markBgClass(workspace: NexeraLogoWorkspace) {
  if (workspace === "cabinet") {
    return "bg-cabinet-500";
  }
  return "bg-[var(--color-nexera-primary)]";
}

function markSoftBgClass(workspace: NexeraLogoWorkspace) {
  if (workspace === "cabinet") {
    return "bg-cabinet-50 dark:bg-cabinet-500/10";
  }
  return "bg-brand-50 dark:bg-brand-500/10";
}

export function NexeraLogo({
  variant = "full",
  workspace: workspaceOverride,
  showContext = true,
  className,
}: NexeraLogoProps) {
  const user = useAuthStore((state) => state.user);
  const workspace = resolveWorkspace(workspaceOverride, user?.workspace);
  const label = contextLabel(workspace);
  const isAuth = variant === "auth";
  const isCompact = variant === "compact";

  const contextColorClass = isAuth
    ? workspace === "cabinet"
      ? "text-cabinet-300"
      : workspace === "entreprise"
        ? "text-blue-light-300"
        : "text-white/55"
    : workspace === "cabinet"
      ? "text-cabinet-600 dark:text-cabinet-300"
      : workspace === "entreprise"
        ? "text-brand-600 dark:text-brand-300"
        : "text-brand-600/90 dark:text-brand-300/90";

  const titleColorClass = isAuth
    ? "text-white"
    : workspace === "cabinet"
      ? "text-cabinet-500 dark:text-cabinet-400"
      : "text-[var(--color-nexera-primary)] dark:text-brand-400";

  const ariaLabel = label ? `NEXERA — ${label}` : "NEXERA";

  if (isCompact) {
    return (
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-xl shadow-theme-xs",
          markBgClass(workspace),
          className,
        )}
        aria-label={ariaLabel}
      >
        <NexeraMark size={26} onBrand workspace={workspace} />
      </div>
    );
  }

  const markSize = isAuth ? 56 : 38;

  if (isAuth) {
    return (
      <div
        className={cn(
          "flex flex-col items-center font-[family-name:var(--font-poppins)] leading-none",
          className,
        )}
        aria-label={ariaLabel}
      >
        <NexeraMark
          size={markSize}
          onBrand
          workspace={workspace}
          className="text-white"
        />
        <span
          className={cn(
            "mt-4 block font-bold tracking-[0.18em]",
            "text-4xl sm:text-5xl",
            titleColorClass,
          )}
        >
          NEXERA
        </span>
        {showContext ? (
          <span
            className={cn(
              "mt-2 block text-xs font-medium uppercase tracking-widest",
              contextColorClass,
            )}
          >
            {label ?? CONTEXT_TAGLINE}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 font-[family-name:var(--font-poppins)] leading-none",
        className,
      )}
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl p-1.5",
          markSoftBgClass(workspace),
        )}
      >
        <NexeraMark
          size={markSize}
          workspace={workspace}
          className={markTintClass(workspace, false)}
        />
      </div>

      <div className="min-w-0">
        <span
          className={cn(
            "block font-bold tracking-[0.18em]",
            "text-xl sm:text-2xl",
            titleColorClass,
          )}
        >
          NEXERA
        </span>

        {showContext ? (
          <span
            className={cn(
              "mt-1.5 block font-medium uppercase tracking-widest",
              "text-[10px] sm:text-xs",
              contextColorClass,
            )}
          >
            {label ?? CONTEXT_TAGLINE}
          </span>
        ) : null}
      </div>
    </div>
  );
}
