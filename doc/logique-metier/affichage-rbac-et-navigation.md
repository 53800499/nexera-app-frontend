# 🔒 Logique Métier Frontend — Contrôle d'Accès RBAC & Navigation Dynamique

Ce document détaille **comment l'interface de Nexera adapte son affichage, sa barre de navigation et ses boutons d'action** selon les rôles, les permissions (`src/modules/roles`) et les abonnements du Tenant.

---

## 1. Filtrage de la Navigation Latérale (`nav.config.ts`)

Le menu latéral (Sidebar) n'est pas statique. Il est filtré dynamiquement à l'initialisation selon 3 critères :

```text
Entrée de Menu
      │
      ├── 1. Le module est-il activé dans l'abonnement du Tenant ?
      │      (ex: option RH activée ou désactivée)
      │
      ├── 2. Le type de compte correspond-il ?
      │      (ex: menu Cabinet affiché uniquement si type = "cabinet")
      │
      └── 3. L'utilisateur possède-t-il la permission requise ?
             (ex: permission "invoice:read")
      │
      ▼
RÉSULTAT : Affiché dans la Sidebar OU Masqué complètement
```

---

## 2. Granularité des Permissions & Groupement (`permissionGroups.ts`)

Dans Nexera, les permissions obéissent à la convention `module:action` ou `module.action` :

| Préfixe / Groupe | Exemples de Permissions | Périmètre |
|---|---|---|
| `invoice:` | `invoice:read`, `invoice:create`, `invoice:validate`, `invoice:delete` | Facturation & Ventes |
| `stock:` | `stock:read`, `stock:movement:create`, `stock:inventory:validate` | Gestion des Stocks |
| `rh:` | `rh:employee:read`, `rh:leave:approve`, `rh:payroll:close` | Ressources Humaines |
| `tax:` | `tax:vat:read`, `tax:vat:declare` | Fiscalité & TVA |
| `cabinet:` | `cabinet:client:switch`, `cabinet:export:fec` | Espace Cabinet |

Le helper `src/modules/roles/utils/permissionGroups.ts` regroupe automatiquement ces codes pour afficher la matrice des droits dans l'écran de gestion des rôles :
```typescript
export function getPermissionGroup(code: string): string {
  if (code.includes(":")) return code.split(":")[0];
  if (code.includes(".")) return code.split(".")[0];
  return "autres";
}
```

---

## 3. Gardes d'Affichage au Niveau Composant (`PermissionGuard`)

Pour empêcher un utilisateur de voir un bouton pour lequel il n'a pas les droits, les composants utilisent le hook de permission :

```tsx
const { hasPermission } = useAuth();

return (
  <div>
    {/* Visible par tous ceux qui ont accès en lecture */}
    <InvoiceDetails invoice={invoice} />

    {/* Le bouton d'émission requiert expressément la permission de validation */}
    {hasPermission("invoice:validate") && canIssueInvoice(invoice.status) && (
      <Button onClick={handleIssueInvoice}>
        Valider et Émettre la Facture
      </Button>
    )}
  </div>
);
```

### Règle d'Or de Sécurité UI :
1. **Masquage préventif :** Si l'utilisateur n'a pas le droit d'exécuter une action, le bouton ne doit pas simplement être désactivé ; **il doit être totalement masqué** pour alléger l'interface.
2. **Double sécurité :** Même si un utilisateur force l'affichage du bouton via les DevTools du navigateur, le backend NestJS rejettera l'appel avec une erreur `403 Forbidden`.
