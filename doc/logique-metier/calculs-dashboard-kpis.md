# 📈 Logique Métier Frontend — Dashboard & Calculs des KPIs

Ce document explique comment le frontend calcule et restitue les indicateurs clés de performance (KPIs) du tableau de bord exécutif (`src/modules/dashboard`).

---

## 1. Vue d'Ensemble des KPIs Affichés

Le tableau de bord centralise 4 cartes financières majeures et des graphiques d'évolution :

```text
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  CHIFFRE D'AFFAIRES    │  │     CRÉANCES CLIENTS   │  │   TRÉSORERIE ENCAISSÉE │  │  TAUX DE CONVERSION    │
│     18 450 000 FCFA    │  │      4 200 000 FCFA    │  │     14 250 000 FCFA    │  │          64,5 %        │
│  [ +12,4 % vs N-1 ]    │  │  [ 8 factures en retard]  │  │   [ 92 % du budget ]   │  │  [ Devis ➔ Factures ]  │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

---

## 2. Formules et Règles de Calcul des Indicateurs

### A. Chiffre d'Affaires de la Période (CA)
- **Factures prises en compte :** Uniquement les factures confirmées (`issued`, `sent`, `partial`, `paid`, `overdue`).
- **Exclusions strictes :** Les factures brouillons (`draft`) et les factures annulées (`cancelled`).
- **Déduction des Avoirs :**
  $$\text{Chiffre d'Affaires HT} = \sum \text{Total HT Factures Émises} - \sum \text{Total HT Avoirs Validés}$$

### B. Variation vs Période Précédente (N vs N-1)
Le composant calcule le pourcentage d'évolution par rapport à la même période antérieure :
```typescript
export function calculateVariationPct(currentPeriodValue: number, previousPeriodValue: number): number | null {
  if (previousPeriodValue === 0) return null;
  return ((currentPeriodValue - previousPeriodValue) / previousPeriodValue) * 100;
}
```
- **Règle d'affichage :**
  - Si $> 0$ : Badge vert avec flèche montante `+12,4 %`.
  - Si $< 0$ : Badge rouge avec flèche descendante `-5,2 %`.
  - Si null ou N-1 = 0 : Affichage d'un tiret neutre `—`.

### C. Encours Client Global & Factures en Retard
- **Encours Client Global :** Somme de tous les restes à payer sur les factures non soldées :
  $$\text{Encours Global} = \sum_{\text{Factures non soldées}} \text{Montant Dû Restant}$$
- **Créances en Retard (Overdue) :** Factures dont la date d'échéance est antérieure à la date courante :
  $$\text{Créance en Retard} = \sum_{\text{dueDate} < \text{today} \land \text{amountDue} > 0} \text{amountDue}$$

### D. Taux de Conversion des Devis
Indicateur de performance commerciale :
$$\text{Taux de Conversion} = \left( \frac{\text{Nombre de Devis avec statut ACCEPTED ou Facturés}}{\text{Nombre Total de Devis émis hors DRAFT}} \right) \times 100$$

---

## 3. Périodes Dynamiques & Formatage des Dates

Le composant `getDefaultDashboardPeriod()` calcule par défaut le mois civil en cours (du 1er du mois à la date du jour) :
```typescript
export function getDefaultDashboardPeriod() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  };
}
```
L'utilisateur peut basculer sur :
- **Mois en cours** (`current_month`)
- **Dernier trimestre** (`quarter`)
- **Année fiscale complète** (`year`)
- **Plage personnalisée** (Datepicker)
