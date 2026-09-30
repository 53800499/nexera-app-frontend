# ⚙️ Logique Métier Frontend — Paramètres Généraux & Profil Utilisateur

Ce document décrit la logique de configuration de l'entreprise (`src/modules/parametres`) et des préférences du profil utilisateur (`src/modules/profile`).

---

## 1. Paramètres Tenant & Personnalisation Fiscale

Dans l'écran `/parametres`, l'administrateur définit les règles de gestion globales du Tenant qui influencent directement les autres modules :

| Paramètre | Impact sur les Autres Modules |
|---|---|
| **Devise par Défaut** (`currency`) | Utilisée par défaut sur tous les devis, factures, catalogues et bulletins (ex: `XOF`, `EUR`, `USD`). |
| **Préfixes de Numérotation** | Modèles des séquences de pièces (ex: `FA-` pour factures, `DE-` pour devis, `BC-` pour commandes). |
| **Taux de TVA par Défaut** | Pré-sélectionné automatiquement lors de l'ajout d'une ligne de vente. |
| **Mentions Légales PDF** | Imprimées en pied de page de tous les documents officiels exportés (capital social, RCCM, IFU, tribunal). |
| **Politique de Stock Négatif** | Autorise ou bloque physiquement les sorties de stock au-delà du disponible. |

---

## 2. Profil Utilisateur & Préférences d'Interface

Dans `/profile` :
- **Thème Visuel (Dark / Light Mode) :** Synchronisé via le store Zustand et appliqué sur la classe `dark` de l'élément racine HTML.
- **Sécurité du Compte :** Changement de mot de passe avec validation de complexité (8+ caractères, majuscule, chiffre, caractère spécial).
- **Session & Déconnexion :** Déconnexion propre révoquant le refreshToken sur le backend et purgeant le stockage local client.
