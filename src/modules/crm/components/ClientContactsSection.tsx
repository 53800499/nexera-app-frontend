"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useActionFeedback } from "@/shared/components/feedback";
import type { Contact } from "../types/client.types";
import {
  contactFormSchema,
  type ContactFormValues,
} from "../schemas/clientForm.schema";
import { useClients } from "../hooks/useClients";

type ContactRowProps = {
  contact: Contact;
  clientId: string;
  canManage: boolean;
  canDelete: boolean;
};

function ContactRow({
  contact,
  clientId,
  canManage,
  canDelete,
}: ContactRowProps) {
  const { runAction } = useActionFeedback();
  const [isEditing, setIsEditing] = useState(false);
  const { updateContactMutation, removeContactMutation } = useClients();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      jobTitle: contact.jobTitle ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
    },
  });

  const handleDelete = () => {
    const label = `${contact.firstName} ${contact.lastName}`;
    const message = contact.isPrimary
      ? `Le contact principal « ${label} » sera supprimé. Un autre contact restera sur la fiche.`
      : `Le contact « ${label} » sera définitivement supprimé.`;

    void runAction({
      confirm: {
        title: "Supprimer ce contact ?",
        message,
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression du contact...",
      success: {
        title: "Contact supprimé",
        message: label,
      },
      error: {
        title: "Suppression impossible",
        message: "Le dernier contact ne peut pas être supprimé (RM-C02).",
      },
      action: () =>
        removeContactMutation.mutateAsync({ contactId: contact.id, clientId }),
    });
  };

  if (isEditing && canManage) {
    return (
      <form
        className="space-y-3 rounded-lg border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5"
        onSubmit={handleSubmit(async (values) => {
          const label = `${values.firstName} ${values.lastName}`;
          const result = await runAction({
            confirm: {
              title: "Enregistrer les modifications ?",
              message: `Mettre à jour le contact ${label}.`,
              confirmLabel: "Enregistrer",
            },
            loadingMessage: "Mise à jour du contact...",
            success: {
              title: "Contact mis à jour",
              message: label,
            },
            error: {
              title: "Impossible de modifier le contact",
            },
            action: () =>
              updateContactMutation.mutateAsync({
                contactId: contact.id,
                clientId,
                payload: {
                  firstName: values.firstName,
                  lastName: values.lastName,
                  jobTitle: values.jobTitle || undefined,
                  email: values.email || undefined,
                  phone: values.phone || undefined,
                },
              }),
          });

          if (result) {
            setIsEditing(false);
          }
        })}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label>Prénom</Label>
            <Input
              {...register("firstName")}
              error={Boolean(errors.firstName)}
              hint={errors.firstName?.message}
            />
          </div>
          <div>
            <Label>Nom</Label>
            <Input
              {...register("lastName")}
              error={Boolean(errors.lastName)}
              hint={errors.lastName?.message}
            />
          </div>
          <div>
            <Label>Fonction</Label>
            <Input {...register("jobTitle")} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input {...register("phone")} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Enregistrer</Button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            onClick={() => {
              reset();
              setIsEditing(false);
            }}
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-800">
      <div>
        <p className="font-medium text-gray-800 dark:text-white/90">
          {contact.firstName} {contact.lastName}
          {contact.isPrimary ? (
            <span className="ml-2 rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-600 dark:bg-brand-500/10">
              Principal
            </span>
          ) : null}
        </p>
        <p className="text-sm text-gray-500">
          {contact.jobTitle || "—"} · {contact.email || "—"} ·{" "}
          {contact.phone || "—"}
        </p>
      </div>
      {canManage ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            onClick={() => setIsEditing(true)}
          >
            Modifier
          </button>
          {canDelete ? (
            <button
              type="button"
              className="rounded border border-error-300 px-2 py-1 text-xs text-error-600 hover:bg-error-50 dark:border-error-500/40 dark:text-error-400"
              onClick={handleDelete}
            >
              Supprimer
            </button>
          ) : (
            <span
              className="text-xs text-gray-400"
              title="RM-C02 — au moins un contact requis"
            >
              Suppression impossible
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  clientId: string;
  contacts: Contact[];
  canManage: boolean;
};

export function ClientContactsSection({
  clientId,
  contacts,
  canManage,
}: Props) {
  const { runAction } = useActionFeedback();
  const [showForm, setShowForm] = useState(false);
  const { addContactMutation } = useClients();
  const canDeleteAny = contacts.length > 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      email: "",
      phone: "",
    },
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Contacts ({contacts.length})
          </h3>
          {contacts.length === 1 ? (
            <p className="text-xs text-gray-500">
              Au moins un contact est requis sur la fiche (RM-C02).
            </p>
          ) : null}
        </div>
        {canManage ? (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Annuler" : "Ajouter un contact"}
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            clientId={clientId}
            canManage={canManage}
            canDelete={canDeleteAny}
          />
        ))}
      </div>

      {showForm && canManage ? (
        <form
          className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800"
          onSubmit={handleSubmit(async (values) => {
            const label = `${values.firstName} ${values.lastName}`;
            const result = await runAction({
              confirm: {
                title: "Ajouter ce contact ?",
                message: `Le contact ${label} sera ajouté à la fiche client.`,
                confirmLabel: "Ajouter",
              },
              loadingMessage: "Ajout du contact...",
              success: {
                title: "Contact ajouté",
                message: label,
              },
              error: {
                title: "Impossible d'ajouter le contact",
              },
              action: () =>
                addContactMutation.mutateAsync({
                  clientId,
                  payload: {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    jobTitle: values.jobTitle || undefined,
                    email: values.email || undefined,
                    phone: values.phone || undefined,
                  },
                }),
            });

            if (result) {
              reset();
              setShowForm(false);
            }
          })}
        >
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nouveau contact
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label>Prénom</Label>
              <Input
                {...register("firstName")}
                error={Boolean(errors.firstName)}
                hint={errors.firstName?.message}
              />
            </div>
            <div>
              <Label>Nom</Label>
              <Input
                {...register("lastName")}
                error={Boolean(errors.lastName)}
                hint={errors.lastName?.message}
              />
            </div>
            <div>
              <Label>Fonction</Label>
              <Input {...register("jobTitle")} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input {...register("phone")} />
            </div>
          </div>
          <Button size="sm">Enregistrer le contact</Button>
        </form>
      ) : null}
    </div>
  );
}
