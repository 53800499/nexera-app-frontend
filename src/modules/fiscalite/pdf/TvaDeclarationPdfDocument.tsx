"use client";

import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { TaxContribuable, TaxDeclarationTva } from "../types/fiscalite.types";
import { formatPdfDate, formatPdfMoney } from "./fiscalitePdfFormat";

const PRIMARY_COLOR = "#0f766e"; // Teal fiscalité
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
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
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
    marginBottom: 14,
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
    width: "40%",
    fontSize: 8,
    fontWeight: "bold",
    color: TEXT_MUTED,
  },
  fieldValue: {
    width: "60%",
    fontSize: 8.5,
    fontWeight: "bold",
    color: DARK_COLOR,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    marginBottom: 14,
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
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowAlternate: {
    backgroundColor: "#fafafa",
  },
  tableCellRubrique: {
    flex: 2.5,
    fontSize: 8.5,
  },
  tableCellTaux: {
    flex: 0.8,
    fontSize: 8.5,
    textAlign: "center",
  },
  tableCellBase: {
    flex: 1.2,
    fontSize: 8.5,
    textAlign: "right",
  },
  tableCellMontant: {
    flex: 1.2,
    fontSize: 8.5,
    textAlign: "right",
    fontWeight: "bold",
  },
  summaryBlock: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  summaryCard: {
    width: "55%",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    backgroundColor: BG_HEADER,
    padding: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 3,
    borderTopWidth: 1.5,
    borderTopColor: PRIMARY_COLOR,
  },
  stampBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
    minHeight: 65,
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

interface TvaDeclarationPdfDocumentProps {
  declaration: TaxDeclarationTva;
  contribuable?: TaxContribuable | null;
}

export const TvaDeclarationPdfDocument: React.FC<TvaDeclarationPdfDocumentProps> = ({
  declaration,
  contribuable,
}) => {
  const isPayee = declaration.statut === "PAYEE";
  const isValidated = declaration.statut === "VALIDEE" || isPayee;

  // Lignes personnalisées ou ventilation standard de la TVA
  const lignes = declaration.lignes || [];

  return (
    <Document title={`Declaration-TVA-${declaration.periode}`}>
      <Page size="A4" style={styles.page}>
        {/* En-tête officiel */}
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
              DÉCLARATION MENSUELLE DE TVA (e-TVA)
            </Text>
            <Text style={styles.docSubTitle}>
              Période déclarative : {declaration.periode} • Échéance légale :{" "}
              {formatPdfDate(declaration.dateLimiteLegale)}
            </Text>
          </View>
        </View>

        {/* Fiche d'identification du contribuable */}
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
              <Text style={styles.fieldLabel}>Secteur d'Activité :</Text>
              <Text style={styles.fieldValue}>
                {contribuable?.secteurActivite || "Général / Prestations"}
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
              <Text style={styles.fieldLabel}>Statut Déclaration :</Text>
              <Text
                style={{
                  ...styles.fieldValue,
                  color: isPayee ? "#16a34a" : isValidated ? "#0284c7" : "#ea580c",
                }}
              >
                {declaration.statut}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Date de Génération :</Text>
              <Text style={styles.fieldValue}>
                {formatPdfDate(declaration.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Tableau de liquidation de la TVA */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableCellRubrique]}>
              Rubrique Déclarative
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellTaux]}>
              Taux
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellBase]}>
              Base H.T. (XOF)
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellMontant]}>
              Montant TVA (XOF)
            </Text>
          </View>

          {/* Lignes déclaratives si disponibles */}
          {lignes.length > 0 ? (
            lignes.map((lig, idx) => (
              <View
                key={lig.id}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlternate : {},
                ]}
              >
                <Text style={styles.tableCellRubrique}>
                  {lig.nature.replace(/_/g, " ")}
                </Text>
                <Text style={styles.tableCellTaux}>{lig.tauxApplique}%</Text>
                <Text style={styles.tableCellBase}>
                  {formatPdfMoney(lig.baseHorsTaxe)}
                </Text>
                <Text style={styles.tableCellMontant}>
                  {formatPdfMoney(lig.montantTva)}
                </Text>
              </View>
            ))
          ) : (
            <>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellRubrique}>
                  1. Opérations imposables - Ventes & Services
                </Text>
                <Text style={styles.tableCellTaux}>18%</Text>
                <Text style={styles.tableCellBase}>
                  {formatPdfMoney(
                    declaration.tvaCollectee > 0
                      ? Math.round(declaration.tvaCollectee / 0.18)
                      : 0
                  )}
                </Text>
                <Text style={styles.tableCellMontant}>
                  {formatPdfMoney(declaration.tvaCollectee)}
                </Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowAlternate]}>
                <Text style={styles.tableCellRubrique}>
                  2. Opérations exonérées & Exportations
                </Text>
                <Text style={styles.tableCellTaux}>0%</Text>
                <Text style={styles.tableCellBase}>0 XOF</Text>
                <Text style={styles.tableCellMontant}>0 XOF</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellRubrique}>
                  3. TVA Déductible sur biens & services
                </Text>
                <Text style={styles.tableCellTaux}>18%</Text>
                <Text style={styles.tableCellBase}>—</Text>
                <Text style={styles.tableCellMontant}>
                  {formatPdfMoney(declaration.tvaDeductible)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Synthèse du calcul & Net à Payer */}
        <View style={styles.summaryBlock}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 8.5, color: TEXT_MUTED }}>
                Total TVA Brute Collectée :
              </Text>
              <Text style={{ fontSize: 8.5, fontWeight: "bold" }}>
                {formatPdfMoney(declaration.tvaCollectee)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 8.5, color: TEXT_MUTED }}>
                Total TVA Déductible Autorisée :
              </Text>
              <Text style={{ fontSize: 8.5, fontWeight: "bold" }}>
                - {formatPdfMoney(declaration.tvaDeductible)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 8.5, color: TEXT_MUTED }}>
                Crédit de TVA Antérieur Reporté :
              </Text>
              <Text style={{ fontSize: 8.5, fontWeight: "bold" }}>
                - {formatPdfMoney(declaration.creditTvaAnterieur)}
              </Text>
            </View>

            <View style={styles.summaryTotalRow}>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: PRIMARY_COLOR }}>
                {declaration.tvaNetteDue >= 0
                  ? "TVA NETTE DUE AU TRÉSOR :"
                  : "CRÉDIT DE TVA À REPORTER :"}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: PRIMARY_COLOR }}>
                {formatPdfMoney(Math.abs(declaration.tvaNetteDue))}
              </Text>
            </View>
          </View>
        </View>

        {/* Cadre de visa & certification */}
        <View style={styles.stampBox}>
          <View style={styles.signatureBlock}>
            <Text style={styles.sigTitle}>
              POUR LE CONTRIBUABLE / DÉCLARANT
            </Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginTop: 2 }}>
              Certifié sincère et conforme aux écritures comptables
            </Text>
            <Text style={{ fontSize: 8, fontWeight: "bold", marginTop: 15 }}>
              Date : {formatPdfDate(new Date().toISOString())}
            </Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.sigTitle}>
              ACCUSÉ D'ENREGISTREMENT DGI
            </Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginTop: 2 }}>
              {isPayee
                ? "Paiement validé par télérèglement DGI"
                : isValidated
                ? "Déclaration télévalidée"
                : "En cours de validation"}
            </Text>
            <Text style={{ fontSize: 8, fontWeight: "bold", marginTop: 15 }}>
              Réf : {declaration.id.substring(0, 16).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Pied de page */}
        <Text style={styles.footerText}>
          Document fiscal généré par NEXERA ERP • Conforme aux dispositions du Code Général des Impôts (CGI 2026) • Télédéclaration officielle
        </Text>
      </Page>
    </Document>
  );
};
