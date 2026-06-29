"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/modules/auth/constants/routes";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import { LoadingBlock } from "@/shared/components/feedback";

type Props = {
  children: React.ReactNode;
};

export function RequireCabinetWorkspace({ children }: Props) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);

  useEffect(() => {
    if (!isSessionReady) return;
    if (!user) {
      router.replace(AUTH_ROUTES.signIn);
      return;
    }
    if (user.workspace !== WORKSPACE_TYPES.CABINET) {
      router.replace("/");
    }
  }, [isSessionReady, router, user]);

  if (!isSessionReady) {
    return <LoadingBlock label="Chargement de l'espace cabinet..." />;
  }

  if (!user || user.workspace !== WORKSPACE_TYPES.CABINET) {
    return <LoadingBlock label="Redirection..." />;
  }

  return <>{children}</>;
}
