# Stratégie de Tests & Qualité d'Interface — Frontend Nexera ERP

---

## 1. Pyramide des Tests Frontend

La fiabilité de l'interface utilisateur de **Nexera ERP** est garantie par une approche multi-niveaux :

```
                  / \
                 /   \
                / E2E \           Parcours Utilisateurs Clés (Playwright / Cypress)
               /-------\
              /  INTÉG  \         Tests d'Intégration Composants (React Testing Library)
             /-----------\
            /   HOOKS &   \       Validation Schémas Zod & Hooks Personnalisés
           /    SCHÉMAS    \
          /-----------------\
         /    STATIQUE &     \    TypeScript Strict Compiler & ESLint 9
        /     LINT / CSS      \
       /-----------------------\
```

---

## 2. Validation Statique & Compilation TypeScript

Avant toute exécution de tests applicatifs, le code frontend est validé statiquement :
- **Contrôle de Typage Strict** : `npx tsc --noEmit` vérifie l'adéquation exacte de tous les types sans générer de fichiers JavaScript.
- **Analyse Linter ESLint 9** : `npm run lint` applique les règles officielles `eslint-config-next` et détecte les violations de hooks React (dépendances manquantes dans `useEffect`, hooks conditionnels interdits).

---

## 3. Tests des Schémas de Validation Zod

Chaque formulaire sensible dispose de tests unitaires vérifiant les règles d'intégrité métier avant même toute soumission réseau :

### Exemple : Cas de Test de Validation Facture
```typescript
describe('invoiceFormSchema', () => {
  it('doit rejeter une facture sans lignes d’articles', () => {
    const invalidData = {
      clientId: 'client-1',
      issueDate: '2026-09-16',
      lines: [],
    };
    const result = invoiceFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('doit valider une facture avec AIB A ou B', () => {
    const validData = {
      clientId: 'client-1',
      issueDate: '2026-09-16',
      mecefAibType: 'A',
      lines: [{ description: 'Prestation', quantity: 1, unitPriceHt: 50000 }],
    };
    const result = invoiceFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
```

---

## 4. Tests d'Intégration des Composants Clés

Les composants à forte valeur ajoutée fiscale font l'objet d'une validation approfondie :
- **`MecefCertificationCard`** :
  - Vérification de l'affichage du sceau vert et du QR Code quand `normalizationStatus === 'normalized'`.
  - Vérification de l'affichage de la bannière rouge d'erreur et du bouton « Réessayer » quand `normalizationStatus === 'failed'`.
  - Contrôle du masquage quand la facture est un simple brouillon (`not_normalized`).
- **`MecefStatusBadge`** :
  - Vérification des libellés et couleurs associés à chaque état du cycle de vie fiscal.

---

## 5. Matrice de Compatibilité Navigateurs & Terminaux

L'interface est certifiée compatible sur les plateformes suivantes :

| Navigateur / OS | Version Minimale | Support Mobile / Tablette |
| :--- | :--- | :--- |
| **Google Chrome / Chromium** | Version 110+ | ✅ Plein support tactile |
| **Mozilla Firefox** | Version 115+ (ESR) | ✅ Plein support |
| **Apple Safari / WebKit** | Version 16+ (macOS / iOS) | ✅ Plein support iOS |
| **Microsoft Edge** | Version 110+ | ✅ Plein support |
| **Navigateurs Android Chrome**| Version 110+ | ✅ Optimisation point de vente |
