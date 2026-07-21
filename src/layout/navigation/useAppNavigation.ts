"use client";

import { useMemo } from "react";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import {
  CABINET_NAV_CONFIG,
  getCabinetNavPermissions,
} from "./cabinetNav.config";
import { MAIN_NAV_CONFIG } from "./nav.config";
import { NAV_ICONS } from "./navIcons";
import type { ResolvedNavItem } from "./types";
import { useNavPermissions } from "./useNavPermissions";

export function useAppNavigation() {
  const user = useAuthUser();
  const permissions = useNavPermissions();
  const isCabinetWorkspace = user?.workspace === WORKSPACE_TYPES.CABINET;

  const cabinetPermissions = useMemo(
    () => getCabinetNavPermissions(user),
    [user],
  );

  const mainItems = useMemo(() => {
    const items: ResolvedNavItem[] = [];

    if (isCabinetWorkspace) {
      for (const nav of CABINET_NAV_CONFIG) {
        if (!nav.canAccess(cabinetPermissions)) continue;
        items.push({
          name: nav.name,
          icon: NAV_ICONS[nav.iconKey],
          path: nav.path,
          subItems: nav.subItems
            ?.filter((sub) =>
              sub.canAccess ? sub.canAccess(cabinetPermissions) : true,
            )
            .map((sub) => ({ name: sub.name, path: sub.path })),
        });
      }
      return items;
    }

    for (const nav of MAIN_NAV_CONFIG) {
      if (!nav.canAccess(permissions)) continue;
      items.push({
        name: nav.name,
        icon: NAV_ICONS[nav.iconKey],
        path: nav.path,
        subItems: nav.subItems
          ?.filter((sub) =>
            sub.canAccess ? sub.canAccess(permissions) : true,
          )
          .map((sub) => ({ name: sub.name, path: sub.path })),
      });
    }

    return items;
  }, [cabinetPermissions, isCabinetWorkspace, permissions]);

  return { mainItems, permissions, isCabinetWorkspace };
}
