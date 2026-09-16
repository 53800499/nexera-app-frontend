# Observabilité & Surveillance de l'Interface — Frontend Nexera ERP

---

## 1. Métriques de Performance Utilisateur (Core Web Vitals)

Nexera surveille en continu la qualité de navigation perçue par les utilisateurs à travers les 3 métriques fondamentales de Google :

| Métrique | Définition & Objectif | Seuil Cible Nexera |
| :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | Temps d'affichage du composant visuel principal. | **< 2.0 secondes** |
| **INP (Interaction to Next Paint)** | Délai de réponse aux clics et saisies clavier. | **< 80 millisecondes** |
| **CLS (Cumulative Layout Shift)** | Stabilité visuelle lors du chargement des blocs. | **< 0.05** |

---

## 2. Capture des Exceptions Non Gérées (`error.tsx`)

Le fichier `src/app/error.tsx` intercepte automatiquement toute erreur d'exécution JavaScript survenue dans un composant enfant :

```typescript
'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Une anomalie inattendue est survenue
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Nos équipes techniques ont été notifiées de l'incident.
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Réessayer l'affichage
      </button>
    </div>
  );
}
```

---

## 3. Détection de Connectivité Réseau

Un hook d'écoute globale (`window.addEventListener('online')` / `window.addEventListener('offline')`) met à jour un bandeau d'information permanent en haut de page lorsque le terminal perd l'accès à Internet, informant le commerçant que les ventes continuent d'être enregistrées dans la base locale IndexedDB.
