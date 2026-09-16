# ADR-002 : Gestion d'État Découplée (TanStack React Query & Zustand)

## Statut
**Accepté**

## Contexte
La gestion d'état dans les ERP est historiquement source de complexité et de bugs (Redux monolithique, duplication des données du serveur dans le store local, incohérences de cache).
Deux types de données distincts coexistent dans Nexera :
1. **L'état serveur (Server State)** : Les factures, clients, devis, paramètres, qui appartiennent à la base de données distante et peuvent être modifiés par d'autres utilisateurs.
2. **L'état client (Client/UI State)** : Le thème actif, la barre latérale ouverte/fermée, l'onglet sélectionné, qui n'ont aucune raison d'être envoyés au serveur.

## Décision
Nous avons banni les stores globaux monolithiques (Redux) au profit d'un découplage fonctionnel strict :
- **TanStack React Query v5** prend en charge 100% de l'état serveur : requêtes asynchrones, mise en cache, déduplication, revalidation en arrière-plan et mutations.
- **Zustand v5** gère exclusivement l'état d'interface utilisateur global via de petits stores atomiques (`useSidebarStore`, `useAuthStore`).

## Conséquences
### Positives :
- Réduction drastique du code boilerplate (plus de reducers, d'actions complexes ou de thunks verbeux).
- Données toujours synchronisées avec la base de données avec gestion intégrée du statut de chargement (`isLoading`, `isError`).
- Performance d'exécution optimale sans re-rendus intempestifs de l'arbre de composants.
