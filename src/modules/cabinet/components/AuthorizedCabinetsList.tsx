"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import { AppError } from "@/shared/core/AppError";
import { useToast } from "@/shared/components/feedback";
import type { AuthorizedCabinet } from "../types/cabinet.types";
import { CabinetPermissionBadges } from "./CabinetPermissionBadges";
import { CabinetPermissionPicker } from "./CabinetPermissionPicker";
import {
  DEFAULT_CABINET_SCOPE_PERMISSIONS,
  type CabinetScopePermissionCode,
} from "../constants/cabinetPermissionLabels";
import { useCabinetAccessGrant } from "../hooks/useCabinetAccessGrant";

type Props = {
  cabinets: AuthorizedCabinet[];
  canManage: boolean;
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function CabinetAccessRow({
  cabinet,
  canManage,
}: {
  cabinet: AuthorizedCabinet;
  canManage: boolean;
}) {
  const toast = useToast();
  const { updatePermissionsMutation, revokeMutation } = useCabinetAccessGrant(false);
  const [isEditing, setIsEditing] = useState(false);
  const [permissions, setPermissions] = useState<CabinetScopePermissionCode[]>(
    (cabinet.permissions?.length
      ? cabinet.permissions
      : DEFAULT_CABINET_SCOPE_PERMISSIONS) as CabinetScopePermissionCode[],
  );

  const handleSave = async () => {
    try {
      await updatePermissionsMutation.mutateAsync({
        cabinetTenantId: cabinet.id,
        permissions,
      });
      toast.success("Droits du cabinet mis à jour.");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof AppError
          ? error.message
          : "Impossible de mettre à jour les droits.",
      );
    }
  };

  const handleRevoke = async () => {
    if (
      !window.confirm(
        `Révoquer l'accès du cabinet « ${cabinet.name} » ? Cette action est immédiate.`,
      )
    ) {
      return;
    }

    try {
      await revokeMutation.mutateAsync({ cabinetTenantId: cabinet.id });
      toast.success("Accès du cabinet révoqué.");
    } catch (error) {
      toast.error(
        error instanceof AppError
          ? error.message
          : "Impossible de révoquer ce cabinet.",
      );
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {cabinet.details?.raisonSociale || cabinet.name}
            </h4>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Accès actif
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Cabinet comptable autorisé depuis le {formatDate(cabinet.linkedAt)}
          </p>
        </div>
        {canManage && !isEditing ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              Modifier les droits
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={revokeMutation.isPending}
              onClick={handleRevoke}
            >
              Révoquer
            </Button>
          </div>
        ) : null}
      </div>

      {/* Détails du cabinet */}
      {cabinet.details ? (
        <div className="mt-3 grid grid-cols-1 gap-2.5 rounded-lg border border-gray-100 bg-gray-50/80 p-3.5 text-xs text-gray-600 sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-800/60 dark:bg-gray-800/40 dark:text-gray-300">
          {cabinet.details.email ? (
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">Email : </span>
              <a
                href={`mailto:${cabinet.details.email}`}
                className="font-medium text-brand-500 hover:underline"
              >
                {cabinet.details.email}
              </a>
            </div>
          ) : null}
          {cabinet.details.telephone ? (
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">Téléphone : </span>
              <a
                href={`tel:${cabinet.details.telephone}`}
                className="font-medium text-brand-500 hover:underline"
              >
                {cabinet.details.telephone}
              </a>
            </div>
          ) : null}
          {cabinet.details.numeroInscriptionOrdre ? (
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">N° Ordre des Experts-Comptables : </span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {cabinet.details.numeroInscriptionOrdre}
              </span>
            </div>
          ) : null}
          {cabinet.details.adresse ? (
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-500 dark:text-gray-400">Adresse : </span>
              <span>{cabinet.details.adresse}</span>
            </div>
          ) : null}
          {cabinet.details.siret ? (
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">SIRET : </span>
              <span className="font-medium">{cabinet.details.siret}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {isEditing ? (
        <div className="mt-4 space-y-4">
          <CabinetPermissionPicker
            value={permissions}
            onChange={setPermissions}
            disabled={updatePermissionsMutation.isPending}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={updatePermissionsMutation.isPending}
              onClick={handleSave}
            >
              {updatePermissionsMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPermissions(
                  (cabinet.permissions?.length
                    ? cabinet.permissions
                    : DEFAULT_CABINET_SCOPE_PERMISSIONS) as CabinetScopePermissionCode[],
                );
                setIsEditing(false);
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Droits accordés
          </p>
          <CabinetPermissionBadges
            permissions={
              cabinet.permissions?.length
                ? cabinet.permissions
                : DEFAULT_CABINET_SCOPE_PERMISSIONS
            }
          />
        </div>
      )}
    </div>
  );
}

export function AuthorizedCabinetsList({ cabinets, canManage }: Props) {
  if (cabinets.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Aucun cabinet comptable autorisé pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {cabinets.map((cabinet) => (
        <CabinetAccessRow
          key={cabinet.id}
          cabinet={cabinet}
          canManage={canManage}
        />
      ))}
    </div>
  );
}
