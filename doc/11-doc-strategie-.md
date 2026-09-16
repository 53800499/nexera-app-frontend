# Stratégie Frontend & Roadmap Produit — Nexera ERP

---

## 1. Vision d'Évolution de l'Expérience Frontend

L'interface de **Nexera ERP** a pour vocation d'offrir la meilleure expérience utilisateur de gestion d'entreprise en Afrique subsaharienne. La feuille de route technique frontend s'articule autour de 4 axes stratégiques majeurs :

```
+-------------------------------------------------------------------------+
|                  AXES STRATÉGIQUES FRONTEND NEXERA                      |
+-------------------------------------------------------------------------+
| [1] Mobilité PWA            : Application installable tablette / mobile |
| [2] Collaboration Temps Réel : WebSockets pour notifications instantanées|
| [3] IA Assistante Embarquée : Auto-complétion et OCR caméra mobile      |
| [4] Internationalisation    : Support multilingue (Français / Anglais)  |
+-------------------------------------------------------------------------+
```

---

## 2. Piliers d'Évolution Technologique

### Pilier 1 : Transformation en Progressive Web App (PWA)
- **Objectif** : Permettre aux commerçants et commerciaux de terrain d'installer Nexera comme une application native sans passer par les stores d'applications (Google Play / App Store).
- **Implémentation** :
  - Déploiement d'un `manifest.json` avec icônes adaptatives et thème de couleur de marque.
  - Configuration de **Service Workers** mettant en cache les assets critiques et l'application shell.
  - Utilisation de la base locale **Dexie.js (IndexedDB)** pour autoriser l'émission de tickets de caisse en l'absence totale de signal réseau.

### Pilier 2 : Échanges Temps Réel par WebSockets (`socket.io-client`)
- **Objectif** : Supprimer le besoin de rafraîchir manuellement les listes de factures ou de devis.
- **Applications** :
  - Réception en direct de la confirmation de certification e-MECeF de la DGI sans polling HTTP.
  - Notification instantanée lors de la validation d'une note de frais par le manager ou d'un paiement en ligne Mobile Money.
  - Présence en direct des collaborateurs du cabinet d'expertise comptable sur un dossier client.

### Pilier 3 : Reconnaissance Visuelle par Caméra (Capture de Reçus)
- **Objectif** : Saisie ultra-rapide des notes de frais en mobilité.
- **Fonctionnement** : L'application web mobile déclenche l'appareil photo, effectue un recadrage automatique du ticket de caisse et pré-remplit les champs montant, date et TVA via les endpoints d'inférence visuelle.

---

## 4. Feuille de Route Trimestrielle Frontend (Roadmap)

```
        2026 Q3 (Actuel)                   2026 Q4                            2027 Q1-Q2
+-----------------------------+   +-----------------------------+   +-----------------------------+
| • Next.js 16 App Router     |   | • Service Workers & PWA     |   | • Mode multi-devises live   |
| • Certification e-MECeF DGI |   | • WebSockets temps réel     |   | • Rapprochement bancaire UI |
| • Rendu PDF vectoriel & QR  |   | • Capture caméra justificatif|  | • Module Anglais bilingue   |
| • Mode Sombre natif complet |   | • Raccourcis clavier pro    |   | • Widgets personnalisables  |
+-----------------------------+   +-----------------------------+   +-----------------------------+
```
