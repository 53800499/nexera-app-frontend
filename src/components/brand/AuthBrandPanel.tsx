"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NexeraLogo,
  type NexeraLogoWorkspace,
} from "@/components/brand/NexeraLogo";
import { useSignupWorkspace } from "@/modules/auth/context/SignupWorkspaceContext";

type AuthBrandPanelProps = {
  workspace?: NexeraLogoWorkspace;
};

export function AuthBrandPanel({ workspace }: AuthBrandPanelProps) {
  const pathname = usePathname();
  const signupWorkspace = useSignupWorkspace();
  const resolvedWorkspace =
    pathname === "/signup"
      ? (signupWorkspace?.workspace ?? "entreprise")
      : (workspace ?? "neutral");

  return (
    <div className="flex flex-col items-center max-w-xs">
      <Link href="/" className="mb-4 block">
        <NexeraLogo variant="auth" workspace={resolvedWorkspace} />
      </Link>
      <p className="text-center text-sm text-gray-400 dark:text-white/60">
        Plateforme ERP & Cabinet d&apos;expertise comptable
      </p>
    </div>
  );
}
