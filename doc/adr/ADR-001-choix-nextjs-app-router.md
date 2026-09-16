# ADR-001 : Choix de Next.js v16 avec App Router et React 19

## Statut
**Accepté** (Décision fondatrice frontend)

## Contexte
Pour concevoir l'interface utilisateur de Nexera ERP, plusieurs options architecturales étaient envisageables :
1. **Single Page Application (SPA) classique** (Vite + React Router) : Simple à déployer, mais temps de chargement initial lourd (*bundle size* élevé) et absence de pré-rendu serveur pour les métadonnées de partage et de sécurité.
2. **Next.js Pages Router historique** : Modèle éprouvé mais rigidité dans la gestion des layouts imbriqués complexes (besoin de basculer facilement entre l'espace entreprise et l'espace cabinet).
3. **Next.js v16 App Router avec React 19** : Gestion native des *Route Groups*, des layouts persistants, du streaming asynchrone et des React Server Components.

## Décision
Nous avons sélectionné **Next.js v16 avec l'App Router et React 19** :
- Utilisation des Route Groups `(admin)`, `(cabinet)` et `(full-width-pages)` permettant d'isoler hermétiquement les contextes visuels et les layouts.
- Rendu hybride permettant d'alléger le JavaScript client grâce aux Server Components.

## Conséquences
### Positives :
- Navigation ultra-fluide entre les modules sans rechargement de la barre latérale ni de l'en-tête.
- Optimisation automatique des bundles de pages et chargement à la demande des composants lourds.
- Préparation optimale pour le passage en Progressive Web App (PWA).
### Négatives & Atténuations :
- Nécessité d'expliciter la directive `"use client"` sur tous les composants exploitant les hooks d'état ou d'effet -> convention rigoureusement adoptée dans l'équipe.
