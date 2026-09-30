# 🏢 Logique Métier Frontend — Espace Cabinet & Gestion Multi-Dossiers

Ce document décrit en détail **la logique de calcul et les règles d'affichage** de l'espace Cabinet comptable (`src/modules/cabinet`).

---

## 1. Sélecteur de Dossier Client Actif & Changement de Contexte

Lorsqu'un collaborateur d'un cabinet d'expertise comptable se connecte, l'entête de l'application intègre un **Sélecteur de Dossier Client** :

```text
Entête Cabinet
┌────────────────────────────────────────────────────────┐
│ NEXERA EXPERTISE  │  Dossier Actif : [ BATIPRO SARL ▼ ] │
└────────────────────────────────────────────────────────┘
```

### Mécanisme de Changement de Contexte (Switching) :
1. L'utilisateur sélectionne un client dans la liste déroulante des mandats actifs.
2. Le store Zustand `useCabinetStore` met à jour `activeClientTenantId`.
3. **Persistance locale :** L'identifiant est conservé dans `sessionStorage` pour survivre aux rafraîchissements de page.
4. **Invalidation globale React Query :** Toutes les requêtes en cache (factures, stocks, déclarations) sont invalidées simultanément pour recharger instantanément les données du dossier sélectionné.
5. **Injection d'En-Tête HTTP :**
   Le client HTTP `authorizedFetch` injecte automatiquement l'en-tête de délégation :
   `X-Cabinet-Delegated-Tenant: <activeClientTenantId>`

---

## 2. Indicateur Visuel de Mode Délégué (Bannière de Contexte)

Pour éviter toute erreur de saisie sur le mauvais dossier client :
- Une **bannière colorée d'avertissement** s'affiche en permanence sous l'entête :
  `💼 Vous intervenez actuellement sur le dossier de BATIPRO SARL en qualité d'Expert-Comptable (Mandat : Tenue comptable).`
- Un bouton rapide permet de revenir au **« Dossier Cabinet Interne »**.

---

## 3. Traduction des Mandats et Missions (`cabinetLabels.ts`)

Pour offrir une interface professionnelle aux experts et à leurs collaborateurs, les statuts de gestion de cabinet sont traduits par le dictionnaire `src/modules/cabinet/utils/cabinetLabels.ts` :

| Code Technique | Libellé Affiché dans l'Interface |
|---|---|
| `TENUE_COMPTABLE` | **Tenue comptable mensuelle** |
| `REVISION_ANNUELLE` | **Révision & Clôture annuelle** |
| `EXPERTISE_PAIE` | **Gestion sociale & Paie** |
| `ASSISTANCE_FISCALE` | **Fiscalité & Déclarations** |
| `AUDIT_CONTRACTUEL` | **Audit contractuel** |
| `MISSION_PONCTUELLE` | **Conseil & Mission ponctuelle** |

---

## 4. Génération & Export du FEC (Fichier des Écritures Comptables)

Sur la vue d'export fiscal du cabinet :
- Le bouton **« Exporter le FEC Officiel »** vérifie que :
  1. La période comptable sélectionnée est clôturée ou révisée (`statutMission === 'TERMINEE' || statutMission === 'EN_REVUE'`).
  2. Aucun compte d'attente (Compte 471) ne comporte d'écritures non lettrées.
- Le fichier texte généré respecte strictement la norme de présentation de l'arrêté ministériel (18 colonnes normalisées séparées par des tabulations ou des pipes).
