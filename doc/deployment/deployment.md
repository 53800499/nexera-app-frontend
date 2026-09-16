# Déploiement & Exploitation de Production — Frontend Nexera ERP

---

## 1. Procédure de Déploiement Standard

La mise en production du frontend de **Nexera ERP** s'effectue en 3 étapes :

1. **Vérification Locale Préalable** :
   ```bash
   # Contrôle de typage et compilation
   npx tsc --noEmit
   npm run build
   ```
2. **Configuration des Variables d'Environnement** :
   Déclaration impérative de `NEXT_PUBLIC_API_URL` pointant vers le domaine HTTPS officiel de l'API backend (ex. `https://api.nexera.bj/api`).
3. **Livraison Continue (CI/CD)** :
   Déploiement automatique sur Cloud Render ou Vercel dès validation du commit sur la branche `main`.

---

## 2. Stratégie de Mise en Cache & CDN

Pour maximiser la réactivité tout en garantissant que les utilisateurs bénéficient immédiatement des nouvelles versions :

- **Fichiers Statiques Hachés (`_next/static/`)** : Mis en cache pour une durée de 1 an sur les réseaux de diffusion de contenu (CDN) :
  `Cache-Control: public, max-age=31536000, immutable`.
- **Documents HTML & Pages App Router** : Servis sans cache persistant pour permettre la détection immédiate des nouveaux déploiements :
  `Cache-Control: public, max-age=0, must-revalidate`.

---

## 3. Plan de Reprise & Rollback

En cas d'anomalie bloquante sur une nouvelle version frontend :
1. Sur Vercel ou Render, déclenchez l'action *Instant Rollback* vers le déploiement précédent sain.
2. La propagation CDN est instantanée (moins de 15 secondes) sans nécessiter de redémarrage de conteneur.
