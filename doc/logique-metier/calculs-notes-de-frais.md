# 🧾 Logique Métier Frontend — Notes de Frais & Indemnités Kilométriques

Ce document décrit en détail **la logique de calcul et les règles d'affichage** du module de notes de frais (`src/modules/notes-frais`).

---

## 1. Moteur de Calcul Réactif des Dépenses

Lors de la saisie d'une note de frais regroupant plusieurs lignes de dépenses :

```text
Lignes de Dépenses Saisies
├── Nuitée Hôtel (Montant saisi : 45 000 FCFA) + Justificatif uploadé
├── Déjeuner Client (Montant saisi : 18 000 FCFA) + Justificatif uploadé
└── Déplacement Client en Véhicule Personnel (Distance saisie : 120 km)
                    │
                    ▼  (Hook de calcul en direct)
       [ MOTEUR DE CALCUL FRONT-END ]
                    │
                    ├── 1. Recalcul instantané de l'indemnité km (120 km x Taux CV)
                    ├── 2. Vérification des plafonds de politique entreprise
                    ├── 3. Détection des justificatifs manquants
                    └── 4. Total général de la note de frais à rembourser
```

---

## 2. Formule de Calcul des Indemnités Kilométriques

Dès que le collaborateur sélectionne la catégorie « Déplacement personnel » et renseigne le kilométrage :
$$\text{Total Ligne IK} = \text{Distance en km} \times \text{Taux Kilométrique du Véhicule}$$

Le composant affiche immédiatement le barème appliqué :
`120 km x 350 FCFA/km (Véhicule 7 CV) = 42 000 FCFA`.

---

## 3. Détection Visuelle des Dépassements de Plafonds

Pour chaque catégorie soumise à un plafond (Hébergement, Restauration) :
- Si `montantSaisi > plafondCategorie` :
  - Un badge d'alerte orange s'affiche : `⚠️ Plafond dépassé (Max autorisé : 35 000 FCFA)`.
  - Un champ de texte obligatoire **« Justification du dépassement »** apparaît automatiquement.
  - La note est étiquetée avec le flag `REQUIRES_FINANCE_APPROVAL` (double validation nécessaire).

---

## 4. Règle d'Obligation de Justificatif Numérique

- Pour toute catégorie non forfaitaire, le bouton de soumission reste grisé tant qu'aucun reçu (image PNG/JPG ou PDF) n'a été téléversé.
- Un visualiseur intégré (*Preview Modal*) permet au collaborateur et au manager de consulter la photo de la facturette avant validation.
