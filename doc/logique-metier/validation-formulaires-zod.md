# 🛡️ Logique Métier Frontend — Validation des Formulaires & Schémas Zod

Ce document explique comment le frontend Nexera traduit directement les règles métier en schémas de validation **Zod** couplés à **React Hook Form**.

---

## 1. Pourquoi Valider au Front-End avec Zod ?

L'utilisation de schémas Zod offre trois garanties fondamentales :
1. **Feedback Utilisateur Immédiat :** L'utilisateur est prévenu dès qu'un champ est invalide (ex: remise à 120 %, quantité à zéro, dates incohérentes).
2. **Économie Réseau :** Aucune requête invalide n'est transmise au serveur.
3. **Sécurité de Typage :** Les types TypeScript des formulaires sont inférés automatiquement (`z.infer<typeof schema>`).

---

## 2. Table de Correspondance : Règles Métier ➔ Schémas Zod

| Règle Métier | Contrainte Fonctionnelle | Traduction Zod dans le Formulaire |
|---|---|---|
| **BM-COM-004** | Une ligne de vente doit avoir une quantité strictement positive | `quantity: z.number().min(0.01, "Quantité obligatoire")` |
| **BM-COM-004** | Le prix unitaire ne peut pas être négatif | `unitPriceHt: z.number().min(0, "Prix unitaire obligatoire")` |
| **BM-COM-004** | Le taux de remise ne peut pas dépasser 100 % | `discountPct: z.number().min(0).max(100, "Max 100%")` |
| **BM-COM-002** | Une facture doit comporter au moins un article | `lines: z.array(invoiceLineSchema).min(1, "Ajoutez au moins une ligne")` |
| **BM-RH-004**  | La date de fin de congé doit être postérieure à la date de début | `.refine(data => data.endDate >= data.startDate, { message: "Date de fin incohérente" })` |
| **BM-NDF-001** | Un justificatif est obligatoire pour toute dépense non forfaitaire | `.refine(data => data.isAllowance || !!data.receiptUrl, { message: "Justificatif obligatoire" })` |

---

## 3. Exemple Concret : Formulaire de Facturation (`invoiceForm.schema.ts`)

```typescript
// src/modules/factures/schemas/invoiceForm.schema.ts
import { z } from "zod";

export const invoiceLineSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().trim().min(1, "Description obligatoire"),
  quantity: z.number().min(0.01, "La quantité doit être supérieure à 0"),
  unitPriceHt: z.number().min(0, "Le prix unitaire doit être positif"),
  discountPct: z.number().min(0).max(100, "La remise doit être comprise entre 0 et 100 %"),
  taxRateId: z.string().min(1, "Le taux de TVA est obligatoire"),
  taxGroup: z.enum(["A", "B", "C", "D", "E", "F"]).optional(),
});

export const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "Le client est obligatoire"),
  invoiceType: z.enum(["standard", "proforma", "deposit", "balance", "credit_note"]),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format invalide").optional().or(z.literal("")),
  globalDiscountPct: z.number().min(0).max(100, "Remise globale max 100 %"),
  mecefAibType: z.enum(["NONE", "A", "B"]).optional(),
  lines: z.array(invoiceLineSchema).min(1, "Ajoutez au moins une ligne de facturation"),
}).refine(
  (data) => {
    if (data.dueDate && data.issueDate) {
      return data.dueDate >= data.issueDate;
    }
    return true;
  },
  {
    message: "La date d'échéance ne peut pas être antérieure à la date d'émission",
    path: ["dueDate"],
  }
);

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
```

---

## 4. Intégration avec React Hook Form

Dans les composants React (ex: `InvoiceCreateModal.tsx`), la validation est branchée sans code verbeux :

```typescript
const form = useForm<InvoiceFormValues>({
  resolver: zodResolver(invoiceFormSchema),
  defaultValues: {
    globalDiscountPct: 0,
    lines: [defaultInvoiceLine()],
  },
  mode: "onChange", // Feedback visuel instantané au fil de la saisie
});
```
- Si une contrainte n'est pas respectée, le champ passe en bordure rouge (`border-rose-500`) et le message explicatif en français s'affiche sous l'input.
- La soumission du formulaire est physiquement bloquée tant que le schéma Zod n'est pas 100 % valide.
