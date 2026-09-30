# 💳 Logique Métier Frontend — Encaissements, Règlements & Lettrage

Ce document décrit en détail **la logique de calcul et les règles d'affichage** du module de gestion des règlements et encaissements clients (`src/modules/encaissements`).

---

## 1. Flux Métier d'un Encaissement

Lorsqu'un client effectue un virement, un paiement par carte, chèque, espèces ou Mobile Money :

```text
Saisie de l'Encaissement
├── Client sélectionné
├── Montant reçu (ex: 500 000 FCFA)
├── Mode de règlement (VIREMENT, ESPECES, CHEQUE, MOBILE_MONEY)
└── Référence bancaire / transaction
                     │
                     ▼
       [ MOTEUR DE VENTILATION FRONT-END ]
                     │
                     ├── Liste des factures en attente du client
                     ├── Proposition automatique d'imputation :
                     │   ├── Facture 1 (Due: 300 000 FCFA) ➔ Imputé 300 000 FCFA (Soldée)
                     │   └── Facture 2 (Due: 400 000 FCFA) ➔ Imputé 200 000 FCFA (Partielle)
                     │
                     ▼
       RÉSULTAT AVANT VALIDATION :
       "Montant total ventilé : 500 000 FCFA | Reste non imputé : 0 FCFA"
```

---

## 2. Règles de Validation des Montants

### A. Règle du Trop-Perçu
- Le montant imputé sur une facture ne peut jamais dépasser son reste à payer (`amountDue`) :
  $$\text{Montant Imputé}_i \le \text{amountDue}_i$$
- Si l'utilisateur saisit un montant supérieur, le champ est immédiatement surligné en rouge avec l'erreur :
  `Le montant imputé dépasse le solde restant dû de cette facture.`

### B. Règle du Reliquat Non Imputé
- Si le montant total reçu est supérieur à la somme des factures sélectionnées :
  - Le reliquat est affiché en étiquette bleue : `Acompte libre / Crédit client : X FCFA`.
  - Ce crédit reste rattaché au compte du client et pourra être imputé sur les factures futures.

---

## 3. Typologie des Modes de Paiement & Exigences d'Affichage

| Mode de Règlement | Champs Requis Affichés dans l'UI | Règle Métier |
|---|---|---|
| **Virement Bancaire** | `Banque émettrice`, `Référence virement` | Preuve de virement obligatoire pour pointage |
| **Chèque** | `N° de chèque`, `Banque tirée`, `Date d'échéance` | Statut initial `EN_ATTENTE_ENCAISSEMENT` jusqu'au dépôt en banque |
| **Mobile Money** | `Opérateur` (MTN, Moov, Wave, Orange), `ID Transaction` | Vérification de la notification SMS / API |
| **Espèces** | `Montant`, `Caisse réceptrice` | Limité au plafond légal de paiement en espèces |

---

## 4. Génération Immédiate du Reçu Client

Dès validation de l'encaissement :
- Le composant propose un bouton **« Télécharger le Reçu d'Encaissement »**.
- Le reçu PDF généré récapitule :
  - Le numéro de quittance / reçu unique chronologique.
  - La date et le mode de règlement.
  - La liste des factures apurées ou partiellement soldées.
  - Le nouveau solde restant dû du client.
