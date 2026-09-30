# 📦 Logique Métier Frontend — Stocks, CMUP & Inventaires

Ce document décrit en détail **la logique de calcul et les règles d'affichage** du module de gestion des stocks (`src/modules/stock`).

---

## 1. Jauges et Indicateurs d'État des Stocks (Système Feu Tricolore)

Pour chaque article du catalogue, le frontend évalue instantanément la situation logistique en comparant la quantité disponible aux seuils paramétrés :

```text
Niveau de Stock Disponible
   │
   ├── Quantité = 0                ──► [ 🔴 RUPTURE TOTALE ] (badge rouge vif)
   │
   ├── 0 < Quantité <= Sécurité    ──► [ 🟠 STOCK CRITIQUE ] (badge orange foncé)
   │
   ├── Sécurité < Qté <= Alerte    ──► [ 🟡 RÉAPPROVISIONNEMENT REQUIS ] (badge ambre)
   │
   └── Quantité > Alerte           ──► [ 🟢 STOCK OPTIMAL ] (badge vert)
```

### Fonction Pure d'Évaluation du Statut :
```typescript
export type StockHealthStatus = 'OUT_OF_STOCK' | 'CRITICAL' | 'LOW' | 'OPTIMAL';

export function getStockHealth(currentStock: number, alertStock: number, safetyStock: number): StockHealthStatus {
  if (currentStock <= 0) return 'OUT_OF_STOCK';
  if (currentStock <= safetyStock) return 'CRITICAL';
  if (currentStock <= alertStock) return 'LOW';
  return 'OPTIMAL';
}
```

---

## 2. Calcul des Écarts en Temps Réel dans les Sessions d'Inventaire

Lors des inventaires physiques en entrepôt, le magasinier saisit les quantités réelles constatées en rayon :

```text
Tableau de Saisie d'Inventaire
┌─────────────────┬────────────┬─────────────┬───────────┬───────────────┐
│ Article         │ Théorique  │ Réel Compté │ Écart Qté │ Écart Valeur  │
├─────────────────┼────────────┼─────────────┼───────────┼───────────────┤
│ Disque Dur 1To  │ 20         │ 18          │ -2 (Rouge)│ -110 000 FCFA │
│ Câble HDMI 2m   │ 50         │ 55          │ +5 (Vert) │ +15 000 FCFA  │
│ Routeur Wifi 6  │ 10         │ 10          │ 0 (Gris)  │ 0 FCFA        │
└─────────────────┴────────────┴─────────────┴───────────┴───────────────┘
```

### Formules Calculées en Direct par Ligne :
$$\text{Écart Quantité} = \text{Quantité Réelle Comptée} - \text{Quantité Théorique Système}$$
$$\text{Écart Valeur (FCFA)} = \text{Écart Quantité} \times \text{CMUP Actuel}$$

### Barre Récapitulative Globale en Haut d'Écran :
Le composant React d'inventaire calcule en continu les totaux :
- **Articles comptés :** $N$ sur Total.
- **Pertes globales constatées :** $\sum \text{Écarts négatifs valorisés}$ (affiché en rouge).
- **Surplus globaux constatés :** $\sum \text{Écarts positifs valorisés}$ (affiché en vert).
- **Impact financier net de l'inventaire :** $\text{Total Surplus} - \text{Total Pertes}$.

---

## 3. Simulation Instantanée du Nouveau CMUP lors des Réceptions

Lors de la saisie d'une réception fournisseur, l'interface calcule et projette immédiatement la nouvelle valeur unitaire du stock :

```text
┌────────────────────────────────────────────────────────┐
│ Article : Rame Papier A4 80g                           │
│ Stock existant : 200 unités à 2 500 FCFA (CMUP actuel) │
│                                                        │
│ Réception en cours : 100 unités à 2 800 FCFA HT        │
│ ────────────────────────────────────────────────────── │
│ NOUVEAU CMUP PROJETÉ : 2 600 FCFA (+100 FCFA / unité)  │
└────────────────────────────────────────────────────────┘
```
Cette simulation permet à l'acheteur d'identifier immédiatement une erreur de saisie de prix d'achat avant validation définitive.
