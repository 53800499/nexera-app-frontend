# 📦 Logique Métier Frontend — Catalogue, Tarifs & Bons de Commande

Ce document détaille **la logique de calcul et les règles d'affichage** du catalogue (`src/modules/catalogue`) et des bons de commande (`src/modules/commandes`).

---

## 1. Catalogue & Gestion des Prix HT / TTC / Marges

Dans la fiche article du catalogue (`CatalogueItemModal.tsx`) :
- L'utilisateur peut saisir soit le **Prix de Vente HT**, soit le **Prix de Vente TTC**.
- Le frontend calcule immédiatement l'autre valeur en fonction du taux de TVA sélectionné :
  $$\text{Prix TTC} = \text{Prix HT} \times \left(1 + \frac{\text{Taux TVA}}{100}\right)$$
  $$\text{Prix HT} = \frac{\text{Prix TTC}}{1 + \frac{\text{Taux TVA}}{100}}$$

### Calcul en Direct de la Marge Commerciale :
Si le Prix d'Achat HT est renseigné :
$$\text{Marge Brute (FCFA)} = \text{Prix Vente HT} - \text{Prix Achat HT}$$
$$\text{Taux de Marge (\%)} = \left(\frac{\text{Marge Brute}}{\text{Prix Achat HT}}\right) \times 100$$
$$\text{Taux de Marque (\%)} = \left(\frac{\text{Marge Brute}}{\text{Prix Vente HT}}\right) \times 100$$
Le badge de rentabilité s'affiche en vert si le taux de marge est supérieur à l'objectif de l'entreprise, ou en orange/rouge s'il est insuffisant.

---

## 2. Bons de Commande (`commandes`) & Cycle de Conversion

Un bon de commande (`Order`) représente l'engagement ferme d'un client ou vers un fournisseur :

```text
               ┌──────────┐
               │  DRAFT   │
               └────┬─────┘
                    │ Confirmer
                    ▼
           ┌─────────────────┐
           │    CONFIRMED    │ ◄─── Réserve les stocks réels (Stock Alloué)
           └────────┬────────┘
                    │
         ┌──────────┴──────────┐
         │ Livré partiellement │ Livré totalement
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ PARTIAL_DELIVERY│   │    DELIVERED    │ ◄─── Déstockage effectif
└────────┬────────┘   └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    │ Générer la Facture
                    ▼
           [ FACTURE ÉMISE ]
```

### Règle de Réservation de Stock :
Dès qu'une commande passe au statut `CONFIRMED`, le stock disponible affiché pour les autres commerciaux diminue immédiatement :
$$\text{Stock Disponible à la Vente} = \text{Stock Physique Réel} - \text{Stock Réservé Commandes Ouvertes}$$
Cela empêche deux commerciaux de vendre le même produit physique en même temps.
