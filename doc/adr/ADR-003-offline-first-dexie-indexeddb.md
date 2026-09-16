# ADR-003 : Architecture Offline-First basée sur Dexie.js (IndexedDB)

## Statut
**Accepté**

## Contexte
Dans l'environnement de déploiement cible (Bénin et Afrique de l'Ouest), les entreprises et commerces font face à des coupures Internet intermittentes ou à des zones à faible couverture réseau mobile.
Bloquer la saisie d'un ticket de caisse ou d'une facture au comptoir parce que la connexion est momentanément interrompue est inacceptable pour un logiciel d'encaissement et de gestion.

## Décision
Nous avons intégré la bibliothèque **Dexie.js v4** comme couche de persistance locale dans le navigateur :
1. Une base de données locale **IndexedDB** (`NexeraOfflineDB`) stocke en local une copie des articles du catalogue et des clients.
2. Les factures créées hors-ligne sont enregistrées immédiatement dans la table locale `offlineInvoices`.
3. Une file d'attente `syncQueue` enregistre les requêtes en attente et les rejoue automatiquement de façon idempotente dès que l'événement navigateur `online` est détecté.

## Conséquences
### Positives :
- Résilience opérationnelle maximale pour les commerces et points de vente.
- Temps de saisie instantané sans latence réseau.
### Négatives & Atténuations :
- La certification e-MECeF de la DGI exige une connexion active -> les factures créées hors-ligne portent la mention temporaire *« En attente de normalisation »* et sont certifiées dès reconnexion.
