"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/modules/auth/constants/routes";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import { LoadingBlock } from "@/shared/components/feedback";

const CABINET_ALLOWED_ADMIN_PATHS = ["/utilisateurs", "/parametres"];

type Props = {
  children: React.ReactNode;
};

export function RequireEntrepriseWorkspace({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  const isSharedAdminPath = CABINET_ALLOWED_ADMIN_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  useEffect(() => {
    if (!isSessionReady) return;
    if (!user) {
      router.replace(AUTH_ROUTES.signIn);
      return;
    }
    if (
      user.workspace === WORKSPACE_TYPES.CABINET &&
      !isSharedAdminPath
    ) {
      router.replace("/cabinet");
    }
  }, [isSessionReady, isSharedAdminPath, router, user]);

  if (!isSessionReady) {
    return <LoadingBlock label="Chargement..." />;
  }

  if (!user) {
    return <LoadingBlock label="Redirection vers la connexion..." />;
  }

  if (user.workspace === WORKSPACE_TYPES.CABINET && !isSharedAdminPath) {
    return <LoadingBlock label="Redirection vers l'espace cabinet..." />;
  }

  return <>{children}</>;
}
