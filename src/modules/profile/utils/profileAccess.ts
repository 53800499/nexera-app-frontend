export function profileHasPermission(
  permissions: string[],
  code: string,
): boolean {
  return permissions.includes(code);
}

/** Droits de lecture des paramètres entreprise, dérivés de GET /profile */
export function canReadTenantSettingsFromProfile(permissions: string[]): boolean {
  return (
    profileHasPermission(permissions, "settings.read") ||
    profileHasPermission(permissions, "manage:settings") ||
    profileHasPermission(permissions, "settings.write")
  );
}

/** Droits de modification des paramètres entreprise, dérivés de GET /profile */
export function canManageTenantSettingsFromProfile(
  permissions: string[],
): boolean {
  return (
    profileHasPermission(permissions, "manage:settings") ||
    profileHasPermission(permissions, "settings.write")
  );
}
