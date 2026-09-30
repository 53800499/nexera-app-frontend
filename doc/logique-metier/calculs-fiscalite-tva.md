# 📊 Logique Métier Frontend — Fiscalité, TVA & Alertes

Ce document détaille **la logique de calcul et les règles d'affichage** du module fiscal (`src/modules/fiscalite`), notamment pour le tableau de bord de la TVA et les alertes d'échéances.

---

## 1. Cartes d'Indicateurs Clés (KPIs TVA)

Sur la vue `/fiscalite/tva`, le frontend calcule et restitue en direct 4 indicateurs fondamentaux :

```text
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│    TVA COLLECTÉE       │  │    TVA DÉDUCTIBLE      │  │   CRÉDIT ANTÉRIEUR     │  │   SOLDE FISCAL NET     │
│    2 450 000 FCFA      │  │    1 600 000 FCFA      │  │      300 000 FCFA      │  │     550 000 FCFA       │
│ (Sur factures clients) │  │ (Sur achats conformes) │  │  (Report mois passé)   │  │   [ À PAYER À LA DGI ] │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

### Logique d'Affichage Dynamique du Solde :
- **Si Solde Net > 0 (TVA à Décaisser) :**
  - Carte sur fond blanc avec bordure ambre/bleue.
  - Libellé : **« TVA nette à reverser au Trésor Public »**.
  - Badge d'échéance : `À régler avant le 15 du mois suivant`.
- **Si Solde Net < 0 (Crédit de TVA) :**
  - Carte sur fond vert émeraude (`bg-emerald-50 text-emerald-800`).
  - Libellé : **« Crédit de TVA reportable sur le mois M+1 »**.
  - Montant affiché en valeur absolue avec mention `À reporter`.

---

## 2. Détection Visuelle des Factures à Risque Fiscal

Pour assister l'utilisateur dans sa conformité légale, le frontend inspecte les factures d'achat fournisseurs et affiche des badges d'alerte :

| Anomalie Détectée | Badge Affiché | Conséquence Visuelle |
|---|---|---|
| **Facture fournisseur sans numéro IFU** | `⚠️ Sans IFU` (Ambre) | La TVA est automatiquement **exclue de la TVA déductible** et un avertissement s'affiche sous le montant. |
| **Dépense somptuaire ou véhicule exclu** | `🚫 Déduction Exclue` (Gris) | La TVA reste à la charge de l'entreprise (non déductible). |
| **Facture non normalisée MECEF** | `⚠️ Non Normalisée` (Rouge) | Risque de rejet en charge lors d'un contrôle fiscal. |

---

## 3. Calendrier Fiscal Interactif

Le frontend calcule le nombre de jours restants avant l'échéance de déclaration légale :

```text
Échéance Déclaration TVA de Septembre : 15 Octobre 2026
┌────────────────────────────────────────────────────────┐
│ Statut : 🟡 J-7 avant la date limite légale            │
│ Action : [ Préparer et Vérifier la Déclaration ]      │
└────────────────────────────────────────────────────────┘
```
- **J-15 à J-6 :** Indicateur d'information bleu.
- **J-5 à J-1 :** Indicateur d'alerte ambre avec notification dans la barre supérieure.
- **Jour J ou dépassé :** Alerte rouge critique mentionnant le risque de pénalité de retard.

---

## 4. Référence Contrats Backend & Architecture M7

Pour les contrats de données d'événements fiscaux (`tax_evenement_source`), le schéma de données PostgreSQL `tax` et les règles d'interconnexion inter-modules complètes (M1 à M7), consulter :
- 📘 [Spécification d'Architecture Module 7 — Fiscalité](../../../back-end/doc/business/fiscalite/NEXERA_M7_Fiscalite_Architecture_Interconnexions_Metier.md)

