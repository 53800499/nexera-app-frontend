"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getRouteContext } from "./routeContext";
import { useNavPermissions } from "./useNavPermissions";

export function useRouteContext() {
  const pathname = usePathname();
  const permissions = useNavPermissions();

  return useMemo(
    () => getRouteContext(pathname, permissions),
    [pathname, permissions],
  );
}
