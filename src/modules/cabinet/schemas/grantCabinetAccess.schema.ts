import { z } from "zod";
import { CABINET_SCOPE_PERMISSIONS } from "../constants/cabinetPermissionLabels";

const INVITE_CODE_REGEX = /^NEXR-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

const permissionCodeSchema = z.enum([
  CABINET_SCOPE_PERMISSIONS.INVOICES_READ,
  CABINET_SCOPE_PERMISSIONS.PAYMENTS_READ,
  CABINET_SCOPE_PERMISSIONS.CLIENTS_READ,
]);

export function normalizeInviteCodeInput(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export const grantCabinetAccessSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "Le code d'invitation est requis")
    .transform(normalizeInviteCodeInput)
    .refine((value) => INVITE_CODE_REGEX.test(value), {
      message: "Format attendu : NEXR-XXXX-XXXX",
    }),
  permissions: z
    .array(permissionCodeSchema)
    .min(1, "Sélectionnez au moins un droit à accorder"),
});

export type GrantCabinetAccessFormValues = z.infer<
  typeof grantCabinetAccessSchema
>;

export const updateCabinetPermissionsSchema = z.object({
  permissions: z
    .array(permissionCodeSchema)
    .min(1, "Sélectionnez au moins un droit à accorder"),
});
