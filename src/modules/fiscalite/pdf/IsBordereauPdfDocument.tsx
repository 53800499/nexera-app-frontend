"use client";

import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { TaxContribuable, TaxExerciceFiscal } from "../types/fiscalite.types";
import { formatPdfDate, formatPdfMoney } from "./fiscalitePdfFormat";

const PRIMARY_COLOR = "#0369a1"; // Sky/Blue for Corporate Tax
const DARK_COLOR = "#0f172a";
const BORDER_COLOR = "#cbd5e1";
const BG_HEADER = "#f8fafc";
const TEXT_MUTED = "#64748b";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: DARK_COLOR,
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 10,
    marginBottom: 12,
  },
  republiqueBlock: {
    alignItems: "center",
    marginBottom: 8,
  },
  repText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: DARK_COLOR,
  },
  ministereText: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  dgiText: {
    fontSize: 9,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginTop: 2,
  },
  titleBlock: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
    marginTop: 6,
  },
  docTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    textTransform: "uppercase",
  },
  docSubTitle: {
    fontSize: 8.5,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  contribuableGrid: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    backgroundColor: BG_HEADER,
  },
  contribCol: {
    flex: 1,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  fieldLabel: {
    width: "42%",
    fontSize: 8,
    fontWeight: "bold",
    color: TEXT_MUTED,
  },
  fieldValue: {
    width: "58%",
    fontSize: 8.5,
    fontWeight: "bold",
    color: DARK_COLOR,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 8.5,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowAlternate: {
    backgroundColor: "#fafafa",
  },
  tableCellLibelle: {
    flex: 2.5,
    fontSize: 8.5,
  },
  tableCellBaseLegale: {
    flex: 1.2,
    fontSize: 8,
    color: TEXT_MUTED,
  },
  tableCellMontant: {
    flex: 1.2,
    fontSize: 8.5,
    textAlign: "right",
    fontWeight: "bold",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    backgroundColor: BG_HEADER,
    padding: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 5,
    marginTop: 3,
    borderTopWidth: 1.5,
    borderTopColor: PRIMARY_COLOR,
  },
  stampBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  signatureBlock: {
    width: "45%",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    minHeight: 60,
  },
  sigTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  footerText: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 7.5,
    color: "#94a3b8",
  },
});

interface IsBordereauPdfDocumentProps {
  exercice: TaxExerciceFiscal;
  contribuable?: TaxContribuable | null;
}

export const IsBordereauPdfDocument: React.FC<IsBordereauPdfDocumentProps> = ({
  exercice,
  contribuable,
}) => {
  const calcul = exercice.calculIs;
  const retraitements = exercice.retraitements || [];
  const acomptes = exercice.acomptesIs || exercice.acomptes || [];

  return (
    <Document title={`Bordereau-IS-${exercice.dateDebut.substring(0, 4)}`}>
      <Page size="A4" style={styles.page}>
        {/* Header officiel */}
        <View style={styles.header}>
          <View style={styles.republiqueBlock}>
            <Text style={styles.repText}>RÉPUBLIQUE DU BÉNIN</Text>
            <Text style={styles.ministereText}>
              Ministère de l'Économie et des Finances
            </Text>
            <Text style={styles.dgiText}>
              DIRECTION GÉNÉRALE DES IMPÔTS (DGI)
            </Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>
              BORDEREAU DE LIQUIDATION DE L'IMPÔT SUR LES SOCIÉTÉS (IS)
            </Text>
            <Text style={styles.docSubTitle}>
              Exercice Fiscal : du {formatPdfDate(exercice.dateDebut)} au{" "}
              {formatPdfDate(exercice.dateFin)} • Régime Général CGI 2026
            </Text>
          </View>
        </View>

        {/* Identification du Contribuable */}
        <View style={styles.contribuableGrid}>
          <View style={styles.contribCol}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Identifiant Fiscal (IFU) :</Text>
              <Text style={styles.fieldValue}>
                {contribuable?.identifiantFiscalUnique || "Non renseigné"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Régime d'Imposition :</Text>
              <Text style={styles.fieldValue}>
                {contribuable?.regimeImposition?.libelle || "Régime Réel Normal"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Centre des Impôts :</Text>
              <Text style={styles.fieldValue}>
                {contribuable?.centreImpotsRattachement || "DGE / CIME Littoral"}
              </Text>
            </View>
          </View>

          <View style={styles.contribCol}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Statut Exercice :</Text>
              <Text style={styles.fieldValue}>{exercice.statut}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Statut Calcul IS :</Text>
              <Text
                style={{
                  ...styles.fieldValue,
                  color:
                    calcul?.statut === "TRANSMIS_M3" || calcul?.statut === "DECLARE"
                      ? "#16a34a"
                      : "#0284c7",
                }}
              >
                {calcul?.statut || "EN_COURS"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Taux IS Appliqué :</Text>
              <Text style={styles.fieldValue}>
                {calcul?.tauxIsApplique ? `${calcul.tauxIsApplique}%` : "30%"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tableau 1 : Détermination du Résultat Fiscal */}
        <Text style={styles.sectionTitle}>
          1. Passage du Résultat Comptable au Résultat Fiscal Imposable
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableCellLibelle]}>
              Nature & Intitulé de l'Opération
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellBaseLegale]}>
              Sens / Base Légale
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellMontant]}>
              Montant (XOF)
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellLibelle}>
              Résultat Comptable Net avant Impôt (Bénéfice ou Perte)
            </Text>
            <Text style={styles.tableCellBaseLegale}>SYSCOHADA</Text>
            <Text style={styles.tableCellMontant}>
              {formatPdfMoney(calcul?.resultatComptableNet)}
            </Text>
          </View>

          {retraitements.map((ret, idx) => (
            <View
              key={ret.id}
              style={[
                styles.tableRow,
                idx % 2 === 1 ? styles.tableRowAlternate : {},
              ]}
            >
              <Text style={styles.tableCellLibelle}>{ret.libelle}</Text>
              <Text style={styles.tableCellBaseLegale}>
                {ret.sens === "REINTEGRATION"
                  ? "(+) Réintégration"
                  : "(-) Déduction"}{" "}
                {ret.baseLegale ? `• ${ret.baseLegale}` : ""}
              </Text>
              <Text
                style={{
                  ...styles.tableCellMontant,
                  color: ret.sens === "REINTEGRATION" ? "#b91c1c" : "#15803d",
                }}
              >
                {ret.sens === "REINTEGRATION" ? "+" : "-"}
                {formatPdfMoney(ret.montant)}
              </Text>
            </View>
          ))}

          <View
            style={[
              styles.tableRow,
              { backgroundColor: "#f0f9ff", borderTopWidth: 1.5 },
            ]}
          >
            <Text style={[styles.tableCellLibelle, { fontWeight: "bold" }]}>
              RÉSULTAT FISCAL DÉFINITIF
            </Text>
            <Text style={styles.tableCellBaseLegale}>CGI Bénin 2026</Text>
            <Text
              style={[
                styles.tableCellMontant,
                { color: PRIMARY_COLOR, fontSize: 9.5 },
              ]}
            >
              {formatPdfMoney(calcul?.resultatFiscal)}
            </Text>
          </View>
        </View>

        {/* Tableau 2 : Liquidation & Suivi des Acomptes */}
        <Text style={styles.sectionTitle}>
          2. Liquidation de l'Impôt et Imputation des Acomptes Versés
        </Text>
        <View style={styles.summaryGrid}>
          {/* Carte Calcul IS */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 8, color: TEXT_MUTED }}>IS Calculé au Taux :</Text>
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                {formatPdfMoney(calcul?.isCalculeTaux)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 8, color: TEXT_MUTED }}>
                Minimum Forfaitaire (MFI) :
              </Text>
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                {formatPdfMoney(calcul?.minimumPerceptionMontant)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 8.5, fontWeight: "bold", color: PRIMARY_COLOR }}>
                IMPÔT SUR LES SOCIÉTÉS DÛ :
              </Text>
              <Text style={{ fontSize: 8.5, fontWeight: "bold", color: PRIMARY_COLOR }}>
                {formatPdfMoney(calcul?.isDu)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 8, color: TEXT_MUTED }}>
                Total Acomptes Déjà Versés :
              </Text>
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                - {formatPdfMoney(calcul?.totalAcomptesVerses)}
              </Text>
            </View>
            <View style={styles.summaryTotalRow}>
              <Text style={{ fontSize: 9.5, fontWeight: "bold", color: PRIMARY_COLOR }}>
                SOLDE FINAL D'IS À PAYER :
              </Text>
              <Text style={{ fontSize: 9.5, fontWeight: "bold", color: PRIMARY_COLOR }}>
                {formatPdfMoney(calcul?.soldeAPayer)}
              </Text>
            </View>
          </View>

          {/* Carte Échéances Acomptes */}
          <View style={styles.summaryCard}>
            <Text
              style={{
                fontSize: 8.5,
                fontWeight: "bold",
                color: TEXT_MUTED,
                marginBottom: 4,
              }}
            >
              ÉCHÉANCIER DES ACOMPTES TRIMESTRIELS
            </Text>
            {acomptes.length > 0 ? (
              acomptes.map((ac) => (
                <View key={ac.id} style={styles.summaryRow}>
                  <Text style={{ fontSize: 8 }}>
                    Acompte N°{ac.numeroAcompte} ({formatPdfDate(ac.dateEcheance)})
                  </Text>
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "bold",
                      color: ac.statut === "PAYE" ? "#16a34a" : "#ea580c",
                    }}
                  >
                    {formatPdfMoney(ac.montantDu)} [{ac.statut}]
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 8, color: TEXT_MUTED, marginTop: 10 }}>
                4 acomptes trimestriels exigibles au 10 Mars, 10 Juin, 10 Septembre et 10 Décembre.
              </Text>
            )}
          </View>
        </View>

        {/* Cadre de signatures */}
        <View style={styles.stampBox}>
          <View style={styles.signatureBlock}>
            <Text style={styles.sigTitle}>
              LE DIRIGEANT / REPRÉSENTANT LÉGAL
            </Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginTop: 2 }}>
              Date : {formatPdfDate(new Date().toISOString())}
            </Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.sigTitle}>
              L'EXPERT-COMPTABLE / COMMISSAIRE AUX COMPTES
            </Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginTop: 2 }}>
              Visa de conformité et transmission comptable M3
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Document fiscal officiel généré par NEXERA ERP • Barèmes et règles de liquidation conformes au Code Général des Impôts (Bénin 2026)
        </Text>
      </Page>
    </Document>
  );
};
