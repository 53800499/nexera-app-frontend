"use client";

import { useAuthStore } from "@/modules/auth/store/authStore";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export function WorkspaceTheme({ children }: Props) {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      document.documentElement.removeAttribute("data-workspace");
      return;
    }

    const workspace =
      user.workspace === WORKSPACE_TYPES.CABINET ? "cabinet" : "entreprise";
    document.documentElement.setAttribute("data-workspace", workspace);
  }, [user]);

  return children;
}
