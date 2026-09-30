"use client";

import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { TaxContribuable, TaxEcheance } from "../types/fiscalite.types";
import { formatPdfDate, formatPdfMoney } from "./fiscalitePdfFormat";

const PRIMARY_COLOR = "#b45309"; // Amber/Bronze for Tax Calendar
const DARK_COLOR = "#0f172a";
const BORDER_COLOR = "#cbd5e1";
const BG_HEADER = "#f8fafc";
const TEXT_MUTED = "#64748b";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: DARK_COLOR,
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 8,
    marginBottom: 10,
  },
  republiqueBlock: {
    alignItems: "center",
    marginBottom: 6,
  },
  repText: {
    fontSize: 9.5,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: DARK_COLOR,
  },
  ministereText: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  dgiText: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginTop: 2,
  },
  titleBlock: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
    marginTop: 5,
  },
  docTitle: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    textTransform: "uppercase",
  },
  docSubTitle: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  contribuableGrid: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    padding: 6,
    marginBottom: 10,
    backgroundColor: BG_HEADER,
  },
  contribCol: {
    flex: 1,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  fieldLabel: {
    width: "40%",
    fontSize: 7.5,
    fontWeight: "bold",
    color: TEXT_MUTED,
  },
  fieldValue: {
    width: "60%",
    fontSize: 8,
    fontWeight: "bold",
    color: DARK_COLOR,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    marginBottom: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 4.5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  tableRowAlternate: {
    backgroundColor: "#fafafa",
  },
  tableCellDate: {
    flex: 1.1,
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCellType: {
    flex: 2.2,
    fontSize: 8,
  },
  tableCellMontant: {
    flex: 1.2,
    fontSize: 8,
    textAlign: "right",
  },
  tableCellPenalite: {
    flex: 1.1,
    fontSize: 8,
    textAlign: "right",
    color: "#b91c1c",
  },
  tableCellStatut: {
    flex: 1.2,
    fontSize: 7.5,
    textAlign: "center",
    fontWeight: "bold",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    backgroundColor: BG_HEADER,
    padding: 8,
    marginBottom: 12,
  },
  summaryCol: {
    alignItems: "center",
    flex: 1,
  },
  footerText: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 7,
    color: "#94a3b8",
  },
});

interface CalendrierFiscalPdfDocumentProps {
  echeances: TaxEcheance[];
  contribuable?: TaxContribuable | null;
}

export const CalendrierFiscalPdfDocument: React.FC<CalendrierFiscalPdfDocumentProps> = ({
  echeances,
  contribuable,
}) => {
  const currentYear = new Date().getFullYear();
  const countRetard = echeances.filter((e) => e.statut === "EN_RETARD").length;
  const countPayees = echeances.filter((e) => e.statut === "PAYEE").length;
  const totalEstime = echeances.reduce((acc, curr) => acc + (curr.montantEstime || 0), 0);
  const totalPenalites = echeances.reduce((acc, curr) => acc + (curr.penaliteEstimee || 0), 0);

  return (
    <Document title={`Calendrier-Fiscal-${currentYear}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.republiqueBlock}>
            <Text style={styles.repText}>RÉPUBLIQUE DU BÉNIN</Text>
            <Text style={styles.ministereText}>
              Ministère de l'Économie et des Finances • Direction Générale des Impôts
            </Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>
              ÉCHÉANCIER FISCAL CONSOLIDÉ &amp; PLAN DE CONFORMITÉ ({currentYear})
            </Text>
            <Text style={styles.docSubTitle}>
              Code Général des Impôts (CGI 2026) • Suivi des forclusions, pénalités et acquittements
            </Text>
          </View>
        </View>

        {/* Fiche Contribuable */}
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
                {contribuable?.regimeImposition?.libelle || "Régime Normal"}
              </Text>
            </View>
          </View>

          <View style={styles.contribCol}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Centre de Rattachement :</Text>
              <Text style={styles.fieldValue}>
                {contribuable?.centreImpotsRattachement || "DGE / CIME Littoral"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Assujettissements :</Text>
              <Text style={styles.fieldValue}>
                TVA : {contribuable?.assujettiTva ? "OUI" : "NON"} • IS :{" "}
                {contribuable?.assujettiIs ? "OUI" : "NON"}
              </Text>
            </View>
          </View>
        </View>

        {/* Synthèse des indicateurs */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCol}>
            <Text style={{ fontSize: 7, color: TEXT_MUTED }}>TOTAL OBLIGATIONS</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>{echeances.length}</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={{ fontSize: 7, color: TEXT_MUTED }}>EN RETARD (CRITIQUE)</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: "#b91c1c" }}>
              {countRetard}
            </Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={{ fontSize: 7, color: TEXT_MUTED }}>DÉJÀ ACQUITTÉES</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: "#16a34a" }}>
              {countPayees}
            </Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={{ fontSize: 7, color: TEXT_MUTED }}>MONTANT ESTIMÉ TOTAL</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              {formatPdfMoney(totalEstime)}
            </Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={{ fontSize: 7, color: TEXT_MUTED }}>PÉNALITÉS ESTIMÉES</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: "#b91c1c" }}>
              {formatPdfMoney(totalPenalites)}
            </Text>
          </View>
        </View>

        {/* Tableau des échéances */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableCellDate]}>
              Date Limite
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellType]}>
              Obligation / Impôt
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellMontant]}>
              Montant Estimé
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellPenalite]}>
              Pénalité CGI 2026
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellStatut]}>
              Statut DGI
            </Text>
          </View>

          {echeances.slice(0, 16).map((ech, idx) => (
            <View
              key={ech.id}
              style={[
                styles.tableRow,
                idx % 2 === 1 ? styles.tableRowAlternate : {},
              ]}
            >
              <Text style={styles.tableCellDate}>{formatPdfDate(ech.dateLimite)}</Text>
              <Text style={styles.tableCellType}>
                {ech.taxType?.libelle || ech.objetLieType?.replace(/_/g, " ") || "Obligation fiscale"}
              </Text>
              <Text style={styles.tableCellMontant}>
                {formatPdfMoney(ech.montantEstime)}
              </Text>
              <Text style={styles.tableCellPenalite}>
                {ech.penaliteEstimee && ech.penaliteEstimee > 0
                  ? `+${formatPdfMoney(ech.penaliteEstimee)}`
                  : "0 XOF"}
              </Text>
              <Text
                style={{
                  ...styles.tableCellStatut,
                  color:
                    ech.statut === "PAYEE"
                      ? "#16a34a"
                      : ech.statut === "EN_RETARD"
                      ? "#b91c1c"
                      : "#d97706",
                }}
              >
                {ech.statut.replace(/_/g, " ")}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Calendrier officiel extrait de NEXERA ERP • Barèmes et dates d'exigibilité conformes au Code Général des Impôts
        </Text>
      </Page>
    </Document>
  );
};
