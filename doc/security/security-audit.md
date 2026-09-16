# Sécurité Côté Client & Audit — Frontend Nexera ERP

---

## 1. Principes de Sécurité dans le Navigateur

L'interface de **Nexera ERP** applique les recommandations de sécurité de l'OWASP applicables aux architectures monopages modernes (SPA / SSR) :

```
+-------------------------------------------------------------------------+
|                  DISPOSITIF DE SÉCURITÉ FRONTEND                        |
+-------------------------------------------------------------------------+
| • Échappement automatique natif React 19 contre les failles XSS         |
| • Stockage des jetons avec politique de renouvellement strict           |
| • Validation systématique des schémas d'entrée avec Zod                 |
| • En-têtes HTTP de sécurité (CSP, X-Frame-Options, HSTS)                |
| • Chiffrement de bout en bout de toutes les communications en HTTPS    |
+-------------------------------------------------------------------------+
```

---

## 2. Protection Contre les Injections XSS (Cross-Site Scripting)

1. **Échappement JSX Garanti** : Tout contenu textuel injecté dans le DOM via `{variable}` est automatiquement échappé par React 19, neutralisant les tentatives d'exécution de balises `<script>` ou d'événements JavaScript arbitraires (`onerror`, `onload`).
2. **Bannissement de `dangerouslySetInnerHTML`** : L'utilisation de cette directive est strictement proscrite dans la base de code, sauf sur des fragments sanitaires préalablement passés par une bibliothèque de nettoyage certifiée.

---

## 3. En-têtes de Sécurité HTTP Recommandés

Déclarés dans `next.config.ts` pour être servis avec chaque réponse HTML :

```typescript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:;",
  },
];
```

---

## 4. Protection des Actions Sensibles & Non-Répudiation

- **Désactivation des Boutons lors de la Soumission** : Prévient les attaques par rejeu involontaire de factures ou de paiements liées aux doubles clics rapides.
- **Confirmation Explicite des Actions Destructives** : Les actions irréversibles (suppression de document brouillon, émission légale, annulation de paiement) exigent une saisie ou une validation dans une boîte de dialogue modale isolée.
