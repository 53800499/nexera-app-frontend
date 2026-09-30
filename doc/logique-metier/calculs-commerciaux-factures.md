# 🧾 Logique Métier Frontend — Ventes, Devis & Facturation

Ce document explique en détail **la logique de calcul et les règles d'affichage** du module commercial et facturation (`src/modules/factures`, `src/modules/devis`).

---

## 1. Moteur de Calcul Réactif des Formulaires de Vente

Dans les formulaires d'édition de factures ou de devis (`InvoiceCreateModal.tsx`, `InvoiceEditView.tsx`), tous les montants sont calculés en temps réel dès qu'un champ change :

```text
Champs Modifiables par l'Utilisateur
├── Quantité (Ligne i)
├── Prix Unitaire HT (Ligne i)
├── Remise Ligne % (Ligne i)
├── Remise Globale %
└── Type Retenue AIB (NONE, A = 1%, B = 5%)
                    │
                    ▼  (Hook useMemo / React Hook Form watch)
        [ MOTEUR DE CALCUL FRONT-END ]
                    │
                    ├──► Total HT Brut par ligne
                    ├──► Montant de la remise ligne
                    ├──► Total HT Net par ligne
                    ├──► Ventilation de la TVA par Groupe (A, B, C...)
                    ├──► Montant de la Remise Globale
                    ├──► Total TTC
                    ├──► Retenue à la source AIB
                    └──► NET À PAYER FINAL (En gros caractères)
```

---

## 2. Formules et Algorithmes de Calcul

### A. Calcul au niveau de chaque ligne de facturation :
```typescript
// Calcul du brut et de la remise individuelle
const totalHtBrutLigne = line.quantity * line.unitPriceHt;
const montantRemiseLigne = totalHtBrutLigne * (line.discountPct / 100);
const totalHtNetLigne = totalHtBrutLigne - montantRemiseLigne;

// Calcul de la taxe de la ligne
const tauxTva = taxRatesById[line.taxRateId]?.rate ?? 0;
const montantTvaLigne = totalHtNetLigne * (tauxTva / 100);
```

### B. Calcul global du document :
```typescript
// 1. Somme des montants nets de lignes
const totalLignesHtNet = lines.reduce((sum, line) => sum + calculateLineHtNet(line), 0);

// 2. Application de la remise globale
const montantRemiseGlobale = totalLignesHtNet * (globalDiscountPct / 100);
const totalHtNetCommercial = totalLignesHtNet - montantRemiseGlobale;

// 3. Ventilation de la TVA par groupe fiscal (A, B, C, D)
const ventilationsTva = calculerVentilationTvaParGroupe(lines, globalDiscountPct);
const totalTva = Object.values(ventilationsTva).reduce((acc, g) => acc + g.montantTva, 0);

// 4. Total TTC
const totalTtc = totalHtNetCommercial + totalTva;

// 5. Retenue à la source AIB MECEF
let tauxAib = 0;
if (mecefAibType === 'A') tauxAib = 0.01;      // 1 % si client ou fournisseur immatriculé
else if (mecefAibType === 'B') tauxAib = 0.05; // 5 % si non professionnel

const montantAib = totalHtNetCommercial * tauxAib;

// 6. Net à payer final par le client
const netAPayer = totalTtc - montantAib;
```

---

## 3. Gardes de Statut & Activation des Boutons (`invoiceStatusRules.ts`)

Pour respecter les principes d'immuabilité fiscale et de contrôle des paiements, le composant de vue ne vérifie pas les statuts avec des conditions éparpillées. Il utilise obligatoirement les fonctions pures du fichier `src/modules/factures/utils/invoiceStatusRules.ts` :

```typescript
// 1. Modification et suppression autorisées UNIQUEMENT si brouillon
export function canEditInvoice(status: string): boolean {
  return normalizeInvoiceStatus(status) === "draft";
}

export function canDeleteInvoice(status: string): boolean {
  return normalizeInvoiceStatus(status) === "draft";
}

// 2. Émission d'une facture brouillon
export function canIssueInvoice(status: string): boolean {
  return normalizeInvoiceStatus(status) === "draft";
}

// 3. Création d'un avoir (Credit Note) : autorisée seulement après émission
export function canCreateCreditNote(status: string): boolean {
  const normalized = normalizeInvoiceStatus(status);
  return ["issued", "sent", "partial", "paid", "overdue"].includes(normalized);
}

// 4. Enregistrement d'un règlement : autorisé si statut ouvert ET montant dû > 0
export function canRecordInvoicePayment(status: string, amountDue: number): boolean {
  const normalized = normalizeInvoiceStatus(status);
  if (amountDue <= 0) return false;
  return ["issued", "sent", "partial", "overdue"].includes(normalized);
}

// 5. Téléchargement du PDF officiel : bloqué pour les brouillons
export function canDownloadInvoicePdf(status: string): boolean {
  return normalizeInvoiceStatus(status) !== "draft";
}
```

---

## 4. Dictionnaire Visuel des Badges de Statut Facture

| Statut Normalisé | Libellé Affiché | Classes Tailwind / Style | Règle Métier Associée |
|---|---|---|---|
| `draft` | **Brouillon** | `bg-slate-100 text-slate-700` | Modifiable, non certifiée, pas de numéro définitif |
| `issued` | **Émise / Validée** | `bg-blue-100 text-blue-800` | Immuable, numéro séquentiel attribué, en attente de paiement |
| `sent` | **Envoyée au client** | `bg-indigo-100 text-indigo-800` | Envoyée par courriel au client |
| `partial` | **Partiellement Payée** | `bg-amber-100 text-amber-800` | Acompte(s) perçu(s), reste à payer $> 0$ |
| `paid` | **Payée (Soldée)** | `bg-emerald-100 text-emerald-800` | Reste à payer $= 0$ FCFA |
| `overdue` | **En Retard d'Échéance** | `bg-rose-100 text-rose-800` | Date limite dépassée avec reste à payer $> 0$ |
| `cancelled` | **Annulée par Avoir** | `bg-purple-100 text-purple-800` | Compensée intégralement par note de crédit |
