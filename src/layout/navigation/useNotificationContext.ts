"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getNotificationPanelContext } from "./contextualNotifications";
import { useNavPermissions } from "./useNavPermissions";

export function useNotificationContext() {
  const pathname = usePathname();
  const permissions = useNavPermissions();

  return useMemo(
    () => getNotificationPanelContext(pathname, permissions),
    [pathname, permissions],
  );
}
