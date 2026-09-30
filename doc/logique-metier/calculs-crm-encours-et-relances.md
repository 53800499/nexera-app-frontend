# 👥 Logique Métier Frontend — CRM, Plafond d'Encours & Relances d'Impayés

Ce document décrit en détail **la logique de calcul et les règles d'affichage** du module CRM (`src/modules/crm`) et du module de relances de paiement (`src/modules/relances`).

---

## 1. CRM & Contrôle du Plafond de Crédit Client

Chaque client entreprise dispose d'un **plafond d'encours autorisé** (`creditLimit`) fixé par la direction financière.

### Formule de l'Encours Utilisé :
$$\text{Encours Actuel Client} = \sum_{\text{Factures non soldées du client}} \text{Montant Restant Dû}$$
$$\text{Crédit Disponible} = \text{Plafond de Crédit} - \text{Encours Actuel Client}$$

### Règle d'Affichage dans le Formulaire de Facturation :
Lors de la sélection d'un client dans le formulaire de création de devis ou facture :
- Le composant affiche un widget d'encours :
  ```text
  Client : BTP CONSTRUCT SARL
  Plafond autorisé : 10 000 000 FCFA
  Encours en cours  :  8 500 000 FCFA
  Crédit disponible :  1 500 000 FCFA
  ```
- **Détection de Dépassement :**
  Si le montant TTC de la nouvelle facture en cours de création est de `2 000 000 FCFA` (dépassement de `500 000 FCFA`) :
  - Une bannière d'alerte ambre apparaît immédiatement :
    `⚠️ Attention : Le montant de cette facture dépasse le plafond de crédit autorisé (Dépassement de 500 000 FCFA).`
  - Selon la politique du Tenant, la validation nécessite l'approbation d'un utilisateur ayant le rôle `DIRECTION_FINANCIERE`.

---

## 2. Balance Âgée & Tranches d'Arriérés de Paiement

Dans la vue des relances (`/relances`), les créances non soldées sont ventilées par tranches d'ancienneté (Balance Âgée) pour identifier les risques d'insolvabilité :

| Tranche d'Âge | Condition sur la Date d'Échéance | Gravité Visuelle | Action Préconisée |
|---|---|---|---|
| **Non Échu (Courant)** | $\text{Date d'échéance} \ge \text{Date du jour}$ | Vert neutre | Aucune relance nécessaire |
| **Retard 1 à 30 jours** | $1 \le \text{Jours de retard} \le 30$ | Ambre clair | **Relance Niveau 1** (Rappel courtois par email) |
| **Retard 31 à 60 jours** | $31 \le \text{Jours de retard} \le 60$ | Orange foncé | **Relance Niveau 2** (Relance ferme + appel téléphonique) |
| **Retard 61 à 90 jours** | $61 \le \text{Jours de retard} \le 90$ | Rouge | **Relance Niveau 3** (Sommation de payer avant contentieux) |
| **Retard > 90 jours** | $\text{Jours de retard} > 90$ | Pourpre / Noir | **Mise en Demeure** formelle / Blocage du compte client |

---

## 3. Gardes de Statut pour les Relances (`reminderStatusRules.ts`)

Pour éviter d'envoyer des relances inappropriées à un client qui a déjà payé ou sur un simple brouillon, le bouton « Relancer » est conditionné par la règle stricte du fichier `src/modules/relances/utils/reminderStatusRules.ts` :

```typescript
export function canSendManualReminder(status: string, amountDue: number): boolean {
  if (amountDue <= 0) return false; // Impossible de relancer une facture soldée
  const normalized = status.toLowerCase();
  return (
    normalized === "overdue" ||
    normalized === "partial" ||
    normalized === "sent" ||
    normalized === "issued"
  );
}
```

### Comportement dans l'Interface :
- Si `amountDue <= 0` ou `status === 'draft'` : Le bouton de relance est totalement masqué ou grisé avec infobulle explicative : `« Aucune relance possible sur une facture non émise ou soldée »`.
- Lors du clic sur « Relancer », une modale préremplit automatiquement le modèle d'email correspondant à l'âge du retard (Niveau 1, Niveau 2 ou Mise en demeure).
