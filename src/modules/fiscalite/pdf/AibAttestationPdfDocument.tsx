"use client";

import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { TaxContribuable, TaxRetenueAib } from "../types/fiscalite.types";
import { formatPdfDate, formatPdfMoney } from "./fiscalitePdfFormat";

const PRIMARY_COLOR = "#4338ca"; // Indigo for AIB
const DARK_COLOR = "#0f172a";
const BORDER_COLOR = "#cbd5e1";
const BG_HEADER = "#f8fafc";
const TEXT_MUTED = "#64748b";

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: DARK_COLOR,
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 10,
    marginBottom: 14,
  },
  republiqueBlock: {
    alignItems: "center",
    marginBottom: 6,
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
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 4,
    padding: 8,
    alignItems: "center",
    marginTop: 8,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    textTransform: "uppercase",
  },
  docSubTitle: {
    fontSize: 8.5,
    color: TEXT_MUTED,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  card: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
    backgroundColor: BG_HEADER,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldLabel: {
    width: "40%",
    fontSize: 8.5,
    fontWeight: "bold",
    color: TEXT_MUTED,
  },
  fieldValue: {
    width: "60%",
    fontSize: 9,
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableCellLibelle: {
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
  legalNotice: {
    borderWidth: 1,
    borderColor: "#c7d2fe",
    backgroundColor: "#f5f3ff",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  legalNoticeText: {
    fontSize: 7.5,
    color: "#4338ca",
    lineHeight: 1.3,
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
    minHeight: 70,
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

interface AibAttestationPdfDocumentProps {
  retenue: TaxRetenueAib;
  contribuable?: TaxContribuable | null;
}

export const AibAttestationPdfDocument: React.FC<AibAttestationPdfDocumentProps> = ({
  retenue,
  contribuable,
}) => {
  const baseCalcul = retenue.baseCalcul || retenue.base || 0;
  const montantRetenu = retenue.montantRetenu || 0;
  const taux = retenue.taux || retenue.tauxApplique || (baseCalcul > 0 ? (montantRetenu / baseCalcul) * 100 : 1);

  return (
    <Document title={`Attestation-AIB-${retenue.id.substring(0, 8)}`}>
      <Page size="A4" style={styles.page}>
        {/* Header officiel */}
        <View style={styles.header}>
          <View style={styles.republiqueBlock}>
            <Text style={styles.repText}>RÉPUBLIQUE DU BÉNIN</Text>
            <Text style={styles.ministereText}>
              Ministère de l'Économie et des Finances
            </Text>
            <Text style={styles.dgiText}>
              DIRECTION GÉNÉRALE DES IMPÔTS • ACOMPTE SUR IMPÔT ASSIS SUR LES BÉNÉFICES
            </Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>
              ATTESTATION OFFICIELLE DE RETENUE À LA SOURCE (AIB)
            </Text>
            <Text style={styles.docSubTitle}>
              Conforme aux dispositions des articles du Code Général des Impôts (CGI 2026)
            </Text>
          </View>
        </View>

        {/* Partie versante (Reteneur) */}
        <Text style={styles.sectionTitle}>1. Identité de la Partie Versante (Reteneur)</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Identifiant Fiscal Unique (IFU) :</Text>
            <Text style={styles.fieldValue}>
              {contribuable?.identifiantFiscalUnique || "Non renseigné"}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Centre des Impôts :</Text>
            <Text style={styles.fieldValue}>
              {contribuable?.centreImpotsRattachement || "DGE / CIME Littoral"}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Régime d'Imposition :</Text>
            <Text style={styles.fieldValue}>
              {contribuable?.regimeImposition?.libelle || "Régime Réel Normal"}
            </Text>
          </View>
        </View>

        {/* Bénéficiaire (Prestataire / Fournisseur retenu) */}
        <Text style={styles.sectionTitle}>2. Identité du Bénéficiaire (Prestataire Retenu)</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nom ou Raison Sociale :</Text>
            <Text style={styles.fieldValue}>
              {retenue.tiersNom || "Tiers prestataire"}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>IFU du Bénéficiaire :</Text>
            <Text style={styles.fieldValue}>
              {retenue.tiersIfu || "Non communiqué"}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Période / Échéance :</Text>
            <Text style={styles.fieldValue}>
              {retenue.periodeDeclarative || formatPdfDate(retenue.createdAt)}
            </Text>
          </View>
        </View>

        {/* Tableau de liquidation de la retenue */}
        <Text style={styles.sectionTitle}>3. Liquidation de la Retenue AIB</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableCellLibelle]}>
              Nature de la Transaction
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellTaux]}>
              Taux AIB
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellBase]}>
              Montant Brut (XOF)
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellMontant]}>
              Montant Retenu (XOF)
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellLibelle}>
              {retenue.natureOperation ? retenue.natureOperation.replace(/_/g, " ") : "Prestation de service / Vente"}
            </Text>
            <Text style={styles.tableCellTaux}>{taux}%</Text>
            <Text style={styles.tableCellBase}>{formatPdfMoney(baseCalcul)}</Text>
            <Text style={[styles.tableCellMontant, { color: PRIMARY_COLOR }]}>
              {formatPdfMoney(montantRetenu)}
            </Text>
          </View>
        </View>

        {/* Mention légale */}
        <View style={styles.legalNotice}>
          <Text style={styles.legalNoticeText}>
            La présente attestation est délivrée en exécution des dispositions du Code Général des Impôts du Bénin. Le montant retenu ci-dessus a été régulièrement reversé au Trésor Public et constitue un crédit d'impôt imputable sur l'Impôt sur les Sociétés (IS) ou l'Impôt sur le Revenu des Personnes Physiques (IRPP) du bénéficiaire.
          </Text>
        </View>

        {/* Cadre de signatures */}
        <View style={styles.stampBox}>
          <View style={styles.signatureBlock}>
            <Text style={styles.sigTitle}>POUR LE RETENEUR (CACHET ET SIGNATURE)</Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginTop: 2 }}>
              Fait le : {formatPdfDate(new Date().toISOString())}
            </Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.sigTitle}>RÉFÉRENCE D'ENREGISTREMENT DGI</Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginTop: 2 }}>
              N° : AIB-{retenue.id.substring(0, 12).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Attestation générée par NEXERA ERP • Valable pour justification fiscale auprès de l'Administration des Impôts du Bénin
        </Text>
      </Page>
    </Document>
  );
};
