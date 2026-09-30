# 🌴 Logique Métier Frontend — RH, Congés & Paie

Ce document décrit en détail **la logique de calcul et les règles d'affichage** du module Ressources Humaines (`src/modules/rh`), notamment pour la gestion des absences, le décompte des congés et la génération des bulletins de salaire.

---

## 1. Décompte Dynamique de la Durée des Absences

Lors de la sélection d'un intervalle de dates pour une demande de congés ou d'absence, le frontend recalcule automatiquement le nombre de jours ouvrés réels à déduire du solde du salarié :

```text
Sélection Utilisateur
├── Date de début (ex: 01 Août) + Début matin/après-midi
└── Date de fin (ex: 10 Août) + Fin midi/soir
                     │
                     ▼
       [ MOTEUR DE DÉCOMPTE TEMPS RÉEL ]
                     │
                     ├── 1. Parcours jour par jour de l'intervalle
                     ├── 2. Exclusion des week-ends (Samedi/Dimanche selon régime)
                     ├── 3. Exclusion des jours fériés légaux de l'année
                     └── 4. Gestion des demi-journées (0,5 jour)
                     │
                     ▼
       RÉSULTAT AFFICHÉ IMMÉDIATEMENT :
       "Durée calculée : 6,5 jours ouvrés"
```

### Algorithme de Décompte :
```typescript
export function calculateWorkingDays(startDate: Date, endDate: Date, publicHolidays: string[]): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay(); // 0 = Dimanche, 6 = Samedi
    const dateString = current.toISOString().split("T")[0];

    // Exclut le week-end et les jours fériés officiels
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = publicHolidays.includes(dateString);

    if (!isWeekend && !isHoliday) {
      count += 1;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}
```

---

## 2. Calcul du Solde Projeté & Feedback Visuel Instantané

Avant même de soumettre le formulaire, le salarié ou le gestionnaire RH visualise l'impact exact sur le solde de congés disponible :

```text
┌────────────────────────────────────────────────────────┐
│ SOLDE ACTUEL DISPONIBLE : 14,0 jours                   │
│ Durée demandée          : - 4,5 jours                  │
│ ────────────────────────────────────────────────────── │
│ NOUVEAU SOLDE PROJETÉ   : 9,5 jours (Statut : Valide)  │
└────────────────────────────────────────────────────────┘
```

### Règle d'Affichage en cas de Dépassement :
Si $\text{Solde Projeté} = \text{Solde Disponible} - \text{Durée Demandée} < 0$ :
- L'indicateur passe en **rouge vif** : `Nouveau solde : -2,5 jours (Solde insuffisant)`.
- Le bouton **« Soumettre la demande »** est automatiquement désactivé (`disabled={projectedBalance < 0}`).
- Une alerte explicative indique au collaborateur de réduire sa durée ou de contacter les RH.

---

## 3. Génération & Rendu du Bulletin de Paie (`useBulletinPdf.ts`)

Le hook `useBulletinPdf` permet de générer à la volée un document PDF vectoriel officiel pour l'employé :
- **Entête légale :** Nom de la société, IFU, RCCM, adresse, période de paie concernée.
- **Détails du salarié :** Nom, Matricule, Date d'embauche, Ancienneté calculée, Emploi occupé, N° de sécurité sociale (CNSS).
- **Tableau des rubriques :**
  - **Rubriques de Gains :** Salaire de base, Primes conventionnelles, Primes exceptionnelles, Heures supplémentaires majorées.
  - **Retenues Salariales :** Cotisation retraite ouvrière, impôt retenu à la source (IRPP / ITS), acomptes sur salaire.
  - **Cotisations Patronales :** Allocations familiales, accidents du travail, part patronale retraite.
- **Cumuls annuels :** Cumul Brut Annuel, Cumul Net Imposable Annuel, Heures Travaillées.
- **Code QR de Vérification :** Contient l'URL d'authentification du document pour les tiers (banques, administrations).

---

## 4. Formatage et Humanisation des Termes (`rhFormatters.ts`)

Pour éviter d'afficher des termes techniques bruts aux utilisateurs finaux, le frontend utilise un traducteur universel :

| Code Backend | Libellé Affiché dans l'UI | Style / Couleur Badge |
|---|---|---|
| `CDI` | **Contrat à Durée Indéterminée (CDI)** | Vert émeraude |
| `CDD` | **Contrat à Durée Déterminée (CDD)** | Bleu ciel |
| `STAGE` | **Stage Professionnel** | Violet |
| `SUBMITTED` | **En Attente de Validation** | Ambre |
| `APPROVED` | **Validé & Confirmé** | Vert |
| `REJECTED` | **Refusé** | Rouge |
| `CONGE_PAYE` | **Congé Annuel Payé** | Bleu primaire |
| `MALADIE` | **Arrêt Maladie Justifié** | Rose |
| `MATERNITE` | **Congé Maternité** | Indigo |

---

## 5. Gestion des Barèmes Fiscaux & Simulateur de Paie Temps Réel (`BaremesFiscauxParamView.tsx`)

Le composant `BaremesFiscauxParamView` regroupe l'administration complète des paramètres légaux et fiscaux de paie :

### A. Les 5 Espaces Fonctionnels
1. **Barèmes ITS (Impôt Progressif) :**
   - Visualisation sous forme de **jauge de progression continue** par tranche (T1: 0% vert émeraude, T2: 10% bleu, T3: 15% violet, T4: 20% ambre, T5: 30% rose/rouge).
   - Sélecteur de millésime / exercice fiscal avec badge `ACTIF` ou `INACTIF`.
   - Action **Dupliquer le barème** vers un nouvel exercice pour reconduire ou modifier les tranches de l'année suivante.
   - Éditeur modale avec table dynamique de tranches et **vérification instantanée de continuité** (empêche tout chevauchement ou rupture de tranches).
2. **Cotisations Sociales & VPS :**
   - Tableau interactif des cotisations salariales (CNSS 3,6%) et patronales (Prestations familiales 9%, AT/MP 2%, Retraite 6,4%, VPS 4% ou 2%).
   - Basculeurs d'activation/désactivation (`toggle`) immédiats sans rechargement.
   - Modale d'édition des taux et des plafonds mensuels de sécurité sociale.
3. **Avantages en Nature (Art. 123 CGI 2026) :**
   - Configuration des règles d'évaluation : pourcentage de la rémunération brute (Logement 15%, Domestique 15%) ou forfaits monétaires (Véhicule, Eau, Électricité, Téléphone).
   - Indicateurs d'assujettissement légal (`Soumis ITS`, `Soumis CNSS`).
4. **Paramètres Pays & Normes :**
   - Paramétrage du SMIG national (52 000 FCFA), de la durée hebdomadaire (40h) et des majorations d'heures supplémentaires.
   - Configuration des échéances de la redevance ORTB (Mars 1 000 FCFA, Juin 3 000 FCFA) et du seuil d'exonération de Juin (50 000 FCFA).
5. **Simulateur Fiscal & Social Interactif en Direct :**
   - Saisie en temps réel : Salaire Brut Contractuel, Nombre de charges familiales (enfants/conjoint), Avantages en nature, Mois de paie testé (pour tester l'impact ORTB de Mars/Juin).
   - **Décomposition Pas-à-Pas Instantanée :**
     - Base brute totale et déduction CNSS salariale (3,6%).
     - Base brute imposable ventilée tranche par tranche avec détail du montant soumis et de l'impôt brut généré.
     - Calcul de l'abattement pour charges de famille (ex: 15% pour 3 charges).
     - Règle d'exonération ORTB mise en évidence visuellement en Juin si le net imposable $\le$ 50 000 FCFA.
     - Calcul des charges patronales (CNSS 17,4% + VPS 4%).
     - Affichage des KPIs clés : **Net à Payer Salarié** et **Coût Global Employeur**.

