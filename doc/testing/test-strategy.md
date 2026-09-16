# Plan de Tests d'Interface Utilisateur — Frontend Nexera ERP

---

## 1. Périmètre de Test & Critères d'Excellence UI

L'assurance qualité de l'interface de **Nexera ERP** est validée selon une matrice rigoureuse combinant conformité métier, réactivité et accessibilité visuelle :

```
+-------------------------------------------------------------------------+
| OBJECTIFS QUALITÉ UI NEXERA :                                           |
|  • Zéro régression sur la saisie et les calculs des formulaires         |
|  • Validation du rendu conditionnel des cartes e-MECeF (succès & échec) |
|  • Fluidité des transitions mode clair / mode sombre                    |
|  • Navigation 100% fonctionnelle au clavier pour les comptables          |
+-------------------------------------------------------------------------+
```

---

## 2. Scénarios de Test d'Interface Majeurs

### Scénario 1 : Validation Interactive du Formulaire de Facturation
1. **Tentative de Soumission Vide** : Clic sur *« Enregistrer »* sans remplir les champs obligatoires -> Vérification de l'affichage des messages d'erreur rouges inline sous chaque champ obligatoire.
2. **Auto-complétion Client** : Sélection d'un client entreprise -> Vérification du remplissage automatique de l'adresse de facturation et de l'IFU.
3. **Calcul Dynamique de TVA & AIB** : Ajout d'une ligne d'article de 100 000 XOF HT avec TVA 18% -> Contrôle instantané de l'affichage de la TVA (18 000 XOF), du TTC (118 000 XOF) et de l'AIB 1% (1 000 XOF).

### Scénario 2 : Cycle Visuel de Normalisation e-MECeF
1. **Ouverture Modale** : Clic sur le bouton *« Normaliser (e-MECeF) »* sur une facture au statut `issued`.
2. **Animation d'Attente** : Vérification du spinner de chargement et du libellé d'attente *« Certification e-MECeF en cours auprès de la DGI... »*.
3. **Validation de l'État Succès** : Affichage de la carte `MecefCertificationCard` avec fond vert émeraude, code de sécurité, compteurs DGI et QR Code lisible.
4. **Validation de l'État Erreur** : Simulation d'un rejet API DGI -> Affichage de la bannière rouge et activation du bouton *« Réessayer »*.

---

## 3. Matrice de Tests d'Accessibilité (WCAG 2.1)

- **Contraste des Textes** : Ratio de contraste minimum de 4.5:1 respecté sur tous les textes informatifs, tant en mode clair (`text-gray-900` sur `bg-white`) qu'en mode sombre (`text-white` sur `bg-gray-900`).
- **Focus Visuel** : Présence d'un anneau de focus contrasté (`ring-2 ring-brand-500`) sur tous les éléments interactifs navigables par tabulation clavier (`Tab` / `Shift+Tab`).
- **Lecteurs d'Écran** : Présence d'attributs `aria-label`, `aria-expanded` et `aria-live` sur les menus déroulants et les messages d'erreur dynamiques.
