# ADR-004 : Standardisation des Formulaires avec React Hook Form et Zod

## Statut
**Accepté**

## Contexte
La gestion des formulaires dans un ERP financier requiert :
- Des performances élevées lors de la saisie de documents comptant des dizaines de lignes d'articles sans ralentissement de la frappe.
- Une validation déclarative stricte et typée réutilisant les mêmes règles métier que le backend.
- Une gestion claire des erreurs de saisie champ par champ.

## Décision
Nous avons généralisé l'utilisation conjointe de **React Hook Form (v7)** et de **Zod (v4)** :
- **React Hook Form** exploite des composants non-contrôlés par défaut (*uncontrolled inputs*) avec enregistrement par ref (`register`), éliminant les re-rendus inutiles à chaque frappe de touche.
- **Zod** définit les schémas de validation métier et génère automatiquement les types TypeScript associés via `z.infer<typeof schema>`.

## Conséquences
### Positives :
- Vitesse de frappe et réactivité maximales sur les tableaux de saisie denses.
- Alignement parfait entre le schéma de validation frontend et les DTOs backend.
- Feedback d'erreur inline précis et accessible.
