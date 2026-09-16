# Spécifications Techniques Détaillées (STD) — Frontend Nexera ERP

---

## 1. Conception des Formulaires Réactifs (RHF + Zod)

Tous les formulaires applicatifs de Nexera sont standardisés autour du couple **React Hook Form v7** et **Zod v4** via `@hookform/resolvers/zod`.

### 1.1 Déclaration de Schéma Typé
Exemple avec le schéma de facturation (`invoiceForm.schema.ts`) :
```typescript
import { z } from 'zod';

export const invoiceLineSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().min(1, 'La description est obligatoire'),
  quantity: z.number().positive('La quantité doit être supérieure à zéro'),
  unitPriceHt: z.number().nonnegative('Le prix unitaire doit être positif ou nul'),
  taxRateId: z.string().optional(),
  discountPct: z.number().min(0).max(100).default(0),
});

export const invoiceFormSchema = z.object({
  clientId: z.string().min(1, 'Veuillez sélectionner un client'),
  issueDate: z.string().min(1, 'La date d’émission est requise'),
  dueDate: z.string().optional(),
  paymentTermId: z.string().optional(),
  mecefAibType: z.enum(['NONE', 'A', 'B']).default('NONE'),
  lines: z.array(invoiceLineSchema).min(1, 'La facture doit comporter au moins une ligne'),
  notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
```

### 1.2 Hydratation Robuste & Clés d'État (`useHydrateFormDefaults`)
Pour éviter les problèmes de perte de saisie lors du rechargement asynchrone des données depuis le serveur, le hook utilitaire `useHydrateFormDefaults` recalcule une clé d'empreinte (`buildFormHydrationKey`) et réinitialise le formulaire de manière déterministe uniquement lorsque les données initiales changent réellement.

### 1.3 Mappage des Erreurs API sur les Champs du Formulaire
Le hook personnalisé `useSettingsFormFeedback` capture les erreurs renvoyées par le backend NestJS (`ValidationPipe`) et injecte automatiquement les messages d'erreur sur chaque champ cible via la méthode `setError` de React Hook Form.

---

## 2. Rendu Dynamique du QR Code e-MECeF

Le composant [MecefCertificationCard.tsx](file:///c:/Sikirou/eskay/FEMAX/Nexera/front-endV1/src/modules/factures/components/MecefCertificationCard.tsx) génère dynamiquement le QR Code de certification de la DGI Bénin sans dépendre d'un service tiers externe :

```typescript
useEffect(() => {
  const qrData = mecefQrCodeData || mecefCode;
  if (!qrData) {
    setQrCodeDataUrl(null);
    return;
  }

  let isMounted = true;
  QRCode.toDataURL(qrData, {
    width: 160,
    margin: 1,
    color: {
      dark: '#064e3b', // Vert émeraude officiel DGI
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  })
    .then((url) => {
      if (isMounted) setQrCodeDataUrl(url);
    })
    .catch((err) => {
      console.error('Erreur génération QR Code e-MECeF:', err);
    });

  return () => {
    isMounted = false;
  };
}, [mecefQrCodeData, mecefCode]);
```

### Copie Sécurisée du Code MECeF
Le code de signature (ex. `BJ01-ABCD-1234-EF56-7890`) est copiable en un clic via l'API Clipboard du navigateur (`navigator.clipboard.writeText`) avec retour haptique/visuel de 2 secondes confirmant la copie.

---

## 3. Gestion des Téléchargements Documentaires (Blobs & Streams)

Lorsqu'un utilisateur sollicite le téléchargement d'un PDF vectoriel certifié (`/invoices/:id/pdf`) ou d'un export de grand livre / FEC :
1. Le client effectue un appel `authorizedFetch` en spécifiant l'en-tête `Accept: application/pdf`.
2. Le flux binaire est récupéré sous forme de `Blob` JavaScript.
3. Une URL d'objet éphémère est instanciée via `window.URL.createObjectURL(blob)`.
4. Un élément d'ancrage `<a>` invisible est programmé pour déclencher le téléchargement avec le nom de fichier officiel (ex. `Facture_FACT-202609-0015_eMECeF.pdf`), puis l'URL d'objet est immédiatement révoquée (`URL.revokeObjectURL`) pour libérer la mémoire vive du navigateur.

---

## 4. Gestion du Thème Visuel (Dark Mode)

Le basculement de thème repose sur la classe CSS `dark` positionnée sur la balise `<html>` racine :
- **Détection Automatique** : Évaluation initiale des préférences système de l'utilisateur (`prefers-color-scheme: dark`).
- **Persistance** : Sauvegarde du choix de l'utilisateur dans `localStorage` et dans un cookie HTTP léger pour éviter l'effet de flash blanc lors du premier rendu serveur Next.js.
- **Classes Utilitaires Tailwind** : Tous les composants utilisent la syntaxe conditionnelle Tailwind `bg-white dark:bg-gray-900 text-gray-900 dark:text-white`.
