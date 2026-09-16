# ADR-005 : Design System Utilitaire Tailwind CSS v4 et Mode Sombre

## Statut
**Accepté**

## Contexte
La cohérence visuelle d'un ERP moderne exige :
- Une vitesse de développement UI élevée avec un système de design réutilisable.
- Un support de premier ordre pour le mode sombre (*Dark Mode*), essentiel pour les professionnels de la comptabilité effectuant de longues sessions de travail.
- Un poids de fichier CSS minimal pour garantir un affichage rapide sur les réseaux mobiles.

## Décision
Nous avons adopté **Tailwind CSS v4** avec le plugin officiel `@tailwindcss/forms` :
- Tous les styles sont exprimés via des classes utilitaires pré-configurées.
- Le mode sombre s'active par la stratégie de classe CSS `dark:` appliquée sur la racine HTML.
- Un ensemble de composants d'interface cohérents (`ComponentCard`, `InputField`, `Button`, `Badge`) encapsule les styles standards de la marque.

## Conséquences
### Positives :
- Taille finale du bundle CSS ultra-légère (< 30 Ko gzippé) grâce à l'élimination des classes inutilisées.
- Bascule fluide entre les thèmes clair et sombre sans redémarrage de l'application.
- Esthétique moderne et professionnelle conforme aux meilleurs standards SaaS internationaux.
