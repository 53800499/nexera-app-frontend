# Parcours Utilisateurs & Guides des Écrans — Frontend Nexera ERP

---

## 1. Parcours 01 : Émission & Certification Fiscale d'une Facture (e-MECeF DGI)

Ce guide décrit le parcours complet de facturation dans l'interface :

```
[1. Création de la Facture]
  └── Navigation vers "Factures > Nouvelle facture"
  └── Sélection du client (auto-complétion de l'IFU)
  └── Ajout des lignes d'articles et vérification des taux de TVA
  └── Clic sur "Enregistrer comme brouillon" -> Statut : DRAFT
       │
       ▼
[2. Émission Légale Définitive]
  └── Vérification de la synthèse financière HT / TVA / TTC
  └── Clic sur le bouton "Émettre la facture"
  └── Confirmation dans la boîte de dialogue
  └── Attribution instantanée du numéro officiel -> Statut : ISSUED
       │
       ▼
[3. Certification e-MECeF auprès de la DGI]
  └── Clic sur le bouton "Normaliser (e-MECeF)"
  └── Ouverture de la modale NormalizeInvoiceModal
  └── Sélection du régime AIB (1% avec IFU, 5% sans IFU, NONE)
  └── Clic sur "Confirmer la normalisation"
       │
       ├──► Si Succès :
       │    └── Affichage de la carte MecefCertificationCard émeraude
       │    └── Affichage du Code de sécurité et des compteurs séquentiels DGI
       │    └── Génération du QR Code interactif haute résolution
       │
       └──► Si Échec :
            └── Affichage de la bannière rouge d'alerte avec le motif DGI
            └── Bouton "Réessayer e-MECeF" pour nouvelle tentative
       │
       ▼
[4. Téléchargement du PDF Officiel]
  └── Clic sur "Télécharger le PDF"
  └── Téléchargement du document certifié avec le cachet et le QR Code légal
```

---

## 2. Parcours 02 : Émission d'un Avoir Rectificatif (Type FA)

1. **Localisation du Document** : Accédez à la facture d'origine dans le menu *Factures*.
2. **Déclenchement de l'Avoir** : Cliquez sur le menu contextuel d'actions puis sur *« Créer un avoir »*.
3. **Conservation du Code Source** : Le système renseigne automatiquement le champ masqué `originalMecefCode` avec la signature de la facture d'origine.
4. **Saisie des Lignes à Rectifier** : Modifiez les quantités ou les montants faisant l'objet du remboursement ou de l'annulation.
5. **Émission & Normalisation** : L'avoir est émis et certifié auprès de la DGI avec la qualification officielle `FA` (Facture d'Avoir).

---

## 3. Parcours 03 : Enregistrement d'un Encaissement & Reçu Client

1. **Accès au Formulaire** : Naviguez vers *Encaissements > Nouveau règlement*.
2. **Sélection du Client** : Le système liste instantanément l'ensemble des factures ouvertes avec leurs soldes restant dus.
3. **Affectation du Règlement** : Saisissez le montant perçu. L'imputation s'effectue automatiquement sur les factures les plus anciennes ou selon votre sélection manuelle.
4. **Validation & Reçu** : Cliquez sur *« Enregistrer le paiement »*. Un reçu de paiement numéroté est immédiatement téléchargeable au format PDF pour remise au client.

---

## 4. Parcours 04 : Saisie d'une Note de Frais par le Collaborateur

1. **Création d'une Dépense** : Sur mobile ou ordinateur, accédez à *Notes de frais > Nouvelle dépense*.
2. **Renseignement des Champs** : Choisissez la date, la catégorie (Repas, Déplacement, Hébergement), saisissez le montant total payé et le montant de TVA déductible.
3. **Téléversement du Reçu** : Glissez la photo du ticket de caisse ou téléversez le PDF du justificatif.
4. **Soumission** : Cliquez sur *« Soumettre pour approbation »*. La note de frais passe au statut `en attente de validation` et notifie automatiquement votre manager.

---

## 5. Parcours 05 : Supervision & Révision par l'Expert-Comptable

1. **Connexion Espace Cabinet** : L'expert-comptable se connecte et accède à la vue *Portefeuille Cabinet*.
2. **Sélection du Dossier Client** : Consultation d'un coup d'œil des indicateurs clés (chiffre d'affaires, factures non certifiées, TVA nette du mois).
3. **Accès au Dossier** : Un clic sur *« Entrer dans le dossier »* bascule l'interface sur les données de l'entreprise cliente.
4. **Pointage & Révision** : L'expert accède aux outils avancés de lettrage des comptes et réalise les vérifications préalables à l'export du fichier FEC dématérialisé (Arrêté 1085-C).
