# 📡 Logique Métier Frontend — Mode Hors-Ligne & Synchronisation (Offline-First)

Ce document explique comment le frontend Nexera gère le **fonctionnement en mode déconnecté**, l'affichage des alertes réseau et la synchronisation avec le serveur.

---

## 1. Détection de Connectivité & Bannières d'État

Le frontend écoute en permanence l'état de la connexion réseau du navigateur :

```typescript
window.addEventListener("online", handleOnline);
window.addEventListener("offline", handleOffline);
```

### Comportement Visuel de l'Interface :
- **En Ligne (Normal) :**
  - Aucun bandeau d'alerte. Les mutations sont transmises directement à l'API NestJS.
- **Hors-Ligne (Déconnecté) :**
  - Une **bannière ambre persistante** apparaît en haut de l'écran :
    `⚠️ Mode Hors-Ligne Actif — Votre connexion est interrompue. Les opérations créées sont enregistrées localement sur votre appareil et seront transmises dès le retour du réseau.`
  - Un **badge de file d'attente** s'affiche dans la barre supérieure :
    `🔄 4 éléments en attente de synchronisation`

---

## 2. Stockage Local Déconnecté (Dexie.js / IndexedDB)

Lorsqu'une facture, un devis ou une sortie de stock est validé alors que l'application est hors-ligne :
1. La mutation n'échoue pas avec une erreur réseau.
2. Le service local écrit l'enregistrement dans la base **IndexedDB locale** (gérée par Dexie) dans la table `offline_queue`.
3. Le document reçoit un identifiant provisoire (ex: `LOCAL-DEV-2026-0004`).
4. L'utilisateur peut immédiatement continuer son travail ou imprimer un ticket provisoire.

---

## 3. Processus de Synchronisation au Rétablissement Réseau

Dès que l'événement `online` est déclenché :

```text
Rétablissement Réseau Détecté
               │
               ▼
     [ Dépilage de la SyncQueue ]
               │
               ├── 1. Envoi par lots (POST /api/sync/batch)
               ├── 2. Le serveur valide chaque opération dans l'ordre chronologique
               ├── 3. Le serveur attribue le numéro officiel définitif
               └── 4. Remplacement de l'identifiant temporaire dans IndexedDB
               │
               ▼
     NOTIFICATION TOAST DE SUCCÈS :
     "✅ 4 opérations synchronisées avec succès avec le serveur."
```

---

## 4. Gestion des Conflits de Données

Si une opération hors-ligne entre en conflit avec l'état actuel de la base de données (ex: rupture de stock intervenue sur le serveur pendant la déconnexion) :
- Le serveur rejette l'opération conflictuelle avec le code `SYNC_CONFLICT_INSUFFICIENT_STOCK`.
- Le badge de synchronisation passe en **rouge** : `⚠️ 1 conflit à résoudre`.
- Une modale de résolution interactive s'ouvre, permettant au gestionnaire de :
  1. Forcer la vente en autorisant un réapprovisionnement d'urgence.
  2. Annuler la vente locale et notifier le client.
