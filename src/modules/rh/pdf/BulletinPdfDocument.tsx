"use client";

import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { RhBulletinPaie } from "../types/rh.types";
import { formatPdfDate, formatPdfMoney } from "@/modules/devis/pdf/quotationPdfFormat";

const PRIMARY_COLOR = "#1b3a6b";
const SECONDARY_COLOR = "#0f766e";
const BORDER_COLOR = "#e2e8f0";
const TEXT_MUTED = "#64748b";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 12,
    marginBottom: 10,
  },
  companyBox: {
    width: "55%",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 3,
  },
  companyInfo: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginBottom: 1.5,
  },
  docMetaBox: {
    width: "40%",
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  docBadge: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 7.5,
    color: "#15803d",
    fontWeight: "bold",
    marginBottom: 4,
  },
  docNumber: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  metaText: {
    fontSize: 8,
    color: TEXT_MUTED,
  },

  // SALARIE & EMPLOI BOXES
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#f8fafc",
  },
  cardTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 3,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  label: {
    fontSize: 7.5,
    color: TEXT_MUTED,
  },
  value: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // TABLE RUBRIQUES
  table: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PRIMARY_COLOR,
    color: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 7.5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 4.5,
    paddingHorizontal: 6,
    fontSize: 7.5,
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },

  // COLUMNS WIDTHS
  colCode: { width: "10%" },
  colLibelle: { width: "35%" },
  colBase: { width: "12%", textAlign: "right" },
  colTaux: { width: "10%", textAlign: "right" },
  colGain: { width: "16%", textAlign: "right" },
  colRetenue: { width: "17%", textAlign: "right" },

  // TOTALS SECTION
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  recapBox: {
    width: "48%",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 6,
    padding: 6,
    backgroundColor: "#f8fafc",
  },
  recapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  netPayBox: {
    width: "48%",
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
  },
  netPayLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#166534",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  netPayAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#15803d",
  },
  netPaySub: {
    fontSize: 7,
    color: "#166534",
    marginTop: 2,
    textAlign: "center",
  },

  // SIGNATURES & LEGAL FOOTER
  signaturesBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    minHeight: 50,
  },
  signatureCol: {
    width: "45%",
  },
  signatureTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: TEXT_MUTED,
    marginBottom: 25,
  },

  legalFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
    textAlign: "center",
    fontSize: 6.5,
    color: "#94a3b8",
  },
});

interface BulletinPdfDocumentProps {
  bulletin: RhBulletinPaie;
}

export const BulletinPdfDocument: React.FC<BulletinPdfDocumentProps> = ({
  bulletin,
}) => {
  const etablissement = bulletin.cyclePaie?.etablissement;
  const employe = bulletin.employe;
  const contrat = bulletin.contrat;

  const currency = "XOF";

  return (
    <Document title={`Bulletin-Paie-${bulletin.numeroBulletin}`}>
      <Page size="A4" style={styles.page}>
        {/* ================= EN-TÊTE BULLETIN ================= */}
        <View style={styles.headerContainer}>
          <View style={styles.companyBox}>
            <Text style={styles.companyName}>
              {etablissement?.raisonSociale || "ENTREPRISE NEXERA"}
            </Text>
            <Text style={styles.companyInfo}>
              {etablissement?.adresseLigne1 || "Siège Social"},{" "}
              {etablissement?.ville || "Cotonou"}
            </Text>
            <Text style={styles.companyInfo}>
              IFU : {etablissement?.ifu || "0202612345678"} • N° CNSS :{" "}
              {etablissement?.numeroCnss || "CNSS-100234"}
            </Text>
            {etablissement?.telephone && (
              <Text style={styles.companyInfo}>Tél : {etablissement.telephone}</Text>
            )}
          </View>

          <View style={styles.docMetaBox}>
            <Text style={styles.docTitle}>BULLETIN DE PAIE</Text>
            <Text style={styles.docBadge}>Conforme CGI Bénin 2026 & SYSCOHADA</Text>
            <Text style={styles.docNumber}>N° {bulletin.numeroBulletin}</Text>
            <Text style={styles.metaText}>
              Période : {formatPdfDate(bulletin.dateDebutPeriode)} au{" "}
              {formatPdfDate(bulletin.dateFinPeriode)}
            </Text>
            <Text style={styles.metaText}>
              Date paiement : {formatPdfDate(bulletin.datePaiement)}
            </Text>
          </View>
        </View>

        {/* ================= SALARIÉ & EMPLOI GRID ================= */}
        <View style={styles.infoGrid}>
          {/* Fiche Salarié */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Salarié Collaborateur</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nom & Prénoms :</Text>
              <Text style={styles.value}>
                {employe?.nom} {employe?.prenoms}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Matricule :</Text>
              <Text style={styles.value}>{employe?.matricule || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>NPI (Identifiant Unique) :</Text>
              <Text style={styles.value}>{employe?.npi || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>N° CNSS Salarié :</Text>
              <Text style={styles.value}>{employe?.numeroCnss || "Non affilié"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>N° IFU Personnel :</Text>
              <Text style={styles.value}>{employe?.numeroIfu || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Charges familiales :</Text>
              <Text style={styles.value}>
                {employe?.situationFamiliale || "Célibataire"} •{" "}
                {employe?.nombreEnfantsCharge || 0} enfant(s)
              </Text>
            </View>
          </View>

          {/* Emploi & Paiement */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Emploi & Conditions</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Poste / Emploi :</Text>
              <Text style={styles.value}>
                {contrat?.poste?.intitule || "Salarié"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Département :</Text>
              <Text style={styles.value}>
                {contrat?.poste?.departement?.libelle || "Principal"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type de Contrat :</Text>
              <Text style={styles.value}>
                {contrat?.typeContrat || "CDI"} • 40h/semaine
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date d'embauche :</Text>
              <Text style={styles.value}>
                {formatPdfDate(contrat?.dateDebut || employe?.dateEntreeEntreprise)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Mode de Règlement :</Text>
              <Text style={styles.value}>{bulletin.modePaiement}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Statut Bulletin :</Text>
              <Text style={styles.value}>{bulletin.statut}</Text>
            </View>
          </View>
        </View>

        {/* ================= TABLEAU DÉTAILLÉ DES RUBRIQUES DE PAIE ================= */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colCode}>Code</Text>
            <Text style={styles.colLibelle}>Rubrique de Paie</Text>
            <Text style={styles.colBase}>Base</Text>
            <Text style={styles.colTaux}>Taux</Text>
            <Text style={styles.colGain}>Gain (+)</Text>
            <Text style={styles.colRetenue}>Retenue (-)</Text>
          </View>

          {bulletin.lignes && bulletin.lignes.length > 0 ? (
            bulletin.lignes.map((ligne, index) => (
              <View
                key={ligne.id || index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={styles.colCode}>{ligne.codeRubrique}</Text>
                <Text style={styles.colLibelle}>{ligne.libelleRubrique}</Text>
                <Text style={styles.colBase}>
                  {ligne.base ? formatPdfMoney(ligne.base, currency) : "—"}
                </Text>
                <Text style={styles.colTaux}>
                  {ligne.taux !== undefined && ligne.taux !== null
                    ? `${Number(ligne.taux).toLocaleString("fr-FR", { maximumFractionDigits: 2, minimumFractionDigits: 0 })} %`
                    : "—"}
                </Text>
                <Text style={styles.colGain}>
                  {ligne.montantGain > 0
                    ? formatPdfMoney(ligne.montantGain, currency)
                    : ""}
                </Text>
                <Text style={styles.colRetenue}>
                  {ligne.montantRetenue > 0
                    ? formatPdfMoney(ligne.montantRetenue, currency)
                    : ""}
                </Text>
              </View>
            ))
          ) : (
            // Lignes standards si détails non chargés
            <>
              <View style={styles.tableRow}>
                <Text style={styles.colCode}>1000</Text>
                <Text style={styles.colLibelle}>Salaire de Base Mensuel</Text>
                <Text style={styles.colBase}>
                  {formatPdfMoney(bulletin.salaireBase, currency)}
                </Text>
                <Text style={styles.colTaux}>100 %</Text>
                <Text style={styles.colGain}>
                  {formatPdfMoney(bulletin.salaireBase, currency)}
                </Text>
                <Text style={styles.colRetenue}></Text>
              </View>
              {bulletin.montantPrimesIndemnitesBrutes > 0 && (
                <View style={[styles.tableRow, styles.tableRowAlt]}>
                  <Text style={styles.colCode}>1100</Text>
                  <Text style={styles.colLibelle}>Primes & Indemnités</Text>
                  <Text style={styles.colBase}>—</Text>
                  <Text style={styles.colTaux}>—</Text>
                  <Text style={styles.colGain}>
                    {formatPdfMoney(bulletin.montantPrimesIndemnitesBrutes, currency)}
                  </Text>
                  <Text style={styles.colRetenue}></Text>
                </View>
              )}
              {bulletin.montantCnssSalariale > 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.colCode}>4000</Text>
                  <Text style={styles.colLibelle}>Cotisation CNSS Salariale (3,6%)</Text>
                  <Text style={styles.colBase}>
                    {formatPdfMoney(bulletin.totalAssietteCnss, currency)}
                  </Text>
                  <Text style={styles.colTaux}>3.6 %</Text>
                  <Text style={styles.colGain}></Text>
                  <Text style={styles.colRetenue}>
                    {formatPdfMoney(bulletin.montantCnssSalariale, currency)}
                  </Text>
                </View>
              )}
              {bulletin.montantImpotSalaire > 0 && (
                <View style={[styles.tableRow, styles.tableRowAlt]}>
                  <Text style={styles.colCode}>5000</Text>
                  <Text style={styles.colLibelle}>Impôt Traitement & Salaires (ITS)</Text>
                  <Text style={styles.colBase}>
                    {formatPdfMoney(bulletin.totalAssietteIts, currency)}
                  </Text>
                  <Text style={styles.colTaux}>Barème</Text>
                  <Text style={styles.colGain}></Text>
                  <Text style={styles.colRetenue}>
                    {formatPdfMoney(bulletin.montantImpotSalaire, currency)}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* ================= RÉCAPITULATIF FINANCIER & NET À PAYER ================= */}
        <View style={styles.totalsContainer}>
          {/* Cumuls & Assiettes */}
          <View style={styles.recapBox}>
            <View style={styles.recapRow}>
              <Text style={styles.label}>Salaire Brut Total :</Text>
              <Text style={styles.value}>
                {formatPdfMoney(bulletin.totalSalaireBrut, currency)}
              </Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.label}>Retenues Salariales Totales :</Text>
              <Text style={styles.value}>
                {formatPdfMoney(bulletin.totalRetenuesSalariales, currency)}
              </Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.label}>Net Fiscal Imposable :</Text>
              <Text style={styles.value}>
                {formatPdfMoney(bulletin.netImposable, currency)}
              </Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.label}>Charges Patronales (CNSS + VPS) :</Text>
              <Text style={styles.value}>
                {formatPdfMoney(bulletin.totalChargesPatronales, currency)}
              </Text>
            </View>
          </View>

          {/* Encart Net à Payer Officiel */}
          <View style={styles.netPayBox}>
            <Text style={styles.netPayLabel}>NET À PAYER</Text>
            <Text style={styles.netPayAmount}>
              {formatPdfMoney(bulletin.netAPayer, currency)}
            </Text>
            <Text style={styles.netPaySub}>Net viré / remis au salarié</Text>
          </View>
        </View>

        {/* ================= SIGNATURES ================= */}
        <View style={styles.signaturesBox}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureTitle}>Signature & Cachet Employeur</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureTitle}>Signature Salarié / Décharge</Text>
          </View>
        </View>

        {/* ================= MENTIONS LÉGALES ================= */}
        <Text style={styles.legalFooter}>
          Pour vous aider à faire valoir vos droits, conservez ce bulletin de paie sans
          limitation de durée. Conforme aux dispositions du Code du Travail et du Code Général
          des Impôts 2026 de la République du Bénin.
        </Text>
      </Page>
    </Document>
  );
};
