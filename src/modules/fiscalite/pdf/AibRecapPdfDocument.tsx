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

const PRIMARY_COLOR = "#047857"; // Emerald/green for AIB Recap
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
    marginBottom: 4,
  },
  repText: {
    fontSize: 9,
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
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
    marginTop: 6,
  },
  docTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    textTransform: "uppercase",
  },
  docSubTitle: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    backgroundColor: BG_HEADER,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  fieldLabel: {
    width: "35%",
    fontSize: 8,
    fontWeight: "bold",
    color: TEXT_MUTED,
  },
  fieldValue: {
    width: "65%",
    fontSize: 8.5,
    fontWeight: "bold",
    color: DARK_COLOR,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  kpiBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#ffffff",
  },
  kpiLabel: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: TEXT_MUTED,
  },
  kpiValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginTop: 2,
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
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 7.5,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  colNum: { width: "5%", fontSize: 7.5, textAlign: "center" },
  colDate: { width: "12%", fontSize: 7.5 },
  colTiers: { width: "28%", fontSize: 7.5 },
  colIfu: { width: "15%", fontSize: 7.5 },
  colType: { width: "12%", fontSize: 7.5, textAlign: "center" },
  colTaux: { width: "8%", fontSize: 7.5, textAlign: "center" },
  colBase: { width: "10%", fontSize: 7.5, textAlign: "right" },
  colAib: { width: "10%", fontSize: 7.5, textAlign: "right", fontWeight: "bold" },
  signaturesBlock: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    padding: 8,
    minHeight: 60,
  },
  signatureTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: DARK_COLOR,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 2,
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.5,
    color: TEXT_MUTED,
  },
});

type Props = {
  retenues: TaxRetenueAib[];
  recap?: {
    totalSubi?: number;
    totalOpere?: number;
    nombreRetenues?: number;
  } | null;
  contribuable?: TaxContribuable | null;
};

export const AibRecapPdfDocument: React.FC<Props> = ({
  retenues,
  recap,
  contribuable,
}) => {
  const annee = new Date().getFullYear();
  const dateEdition = formatPdfDate(new Date().toISOString());

  const isRetenueSubie = (r: TaxRetenueAib) =>
    r.natureAib ? r.natureAib === "SUBIE" : (r.imputableIs ?? true);

  const totalSubi =
    recap?.totalSubi ??
    retenues
      .filter((r) => isRetenueSubie(r))
      .reduce((sum, r) => sum + (r.montantRetenu || 0), 0);

  const totalOpere =
    recap?.totalOpere ??
    retenues
      .filter((r) => !isRetenueSubie(r))
      .reduce((sum, r) => sum + (r.montantRetenu || 0), 0);

  const raisonSociale =
    (contribuable as any)?.raisonSociale ||
    contribuable?.secteurActivite ||
    (contribuable?.identifiantFiscalUnique ? `IFU ${contribuable.identifiantFiscalUnique}` : "Nexera Entreprise");

  return (
    <Document
      title={`Bordereau_Recapitulatif_AIB_${annee}`}
      author={raisonSociale}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Entête officiel Bénin */}
        <View style={styles.header}>
          <View style={styles.republiqueBlock}>
            <Text style={styles.repText}>RÉPUBLIQUE DU BÉNIN</Text>
            <Text style={styles.ministereText}>
              MINISTÈRE DE L&apos;ÉCONOMIE ET DES FINANCES
            </Text>
            <Text style={styles.dgiText}>
              DIRECTION GÉNÉRALE DES IMPÔTS (DGI)
            </Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>
              ÉTAT RÉCAPITULATIF DES RETENUES À LA SOURCE (AIB) — GESTION {annee}
            </Text>
            <Text style={styles.docSubTitle}>
              Art. 130 à 133 du Code Général des Impôts (CGI Bénin) • Acompte sur Impôt assis sur les Bénéfices
            </Text>
          </View>
        </View>

        {/* Fiche d'identification */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Raison Sociale :</Text>
                <Text style={styles.fieldValue}>
                  {raisonSociale}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>N° IFU :</Text>
                <Text style={styles.fieldValue}>
                  {contribuable?.identifiantFiscalUnique || "NON RENSEIGNÉ"}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Régime d&apos;Imposition :</Text>
                <Text style={styles.fieldValue}>
                  {contribuable?.regimeImposition?.libelle || "RÉEL NORMAL"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date d&apos;Édition :</Text>
                <Text style={styles.fieldValue}>{dateEdition}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Synthèse des KPIs */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Retenues Subies (Imputables sur l&apos;IS)</Text>
            <Text style={[styles.kpiValue, { color: "#047857" }]}>
              {formatPdfMoney(totalSubi)}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Retenues Opérées (À reverser au Trésor)</Text>
            <Text style={[styles.kpiValue, { color: "#b45309" }]}>
              {formatPdfMoney(totalOpere)}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Nombre Total d&apos;Opérations</Text>
            <Text style={[styles.kpiValue, { color: DARK_COLOR }]}>
              {retenues.length}
            </Text>
          </View>
        </View>

        {/* Tableau détaillé des retenues */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNum]}>N°</Text>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.colTiers]}>Bénéficiaire / Tiers</Text>
            <Text style={[styles.tableHeaderCell, styles.colIfu]}>IFU Tiers</Text>
            <Text style={[styles.tableHeaderCell, styles.colType]}>Type</Text>
            <Text style={[styles.tableHeaderCell, styles.colTaux]}>Taux</Text>
            <Text style={[styles.tableHeaderCell, styles.colBase]}>Base HT</Text>
            <Text style={[styles.tableHeaderCell, styles.colAib]}>AIB (FCFA)</Text>
          </View>
          {retenues.length === 0 ? (
            <View style={[styles.tableRow, { justifyContent: "center" }]}>
              <Text style={{ fontSize: 7.5, color: TEXT_MUTED }}>
                Aucune retenue AIB enregistrée pour cet exercice.
              </Text>
            </View>
          ) : (
            retenues.slice(0, 35).map((r, idx) => {
              const isSubie = isRetenueSubie(r);
              const tiers = r.tiersNom || (r.natureOperation ? r.natureOperation.replace(/_/g, " ") : "—");
              const ifu = r.tiersIfu || "Non renseigné";
              const taux = r.tauxApplique ?? r.taux ?? 1;
              const base = r.base ?? r.baseCalcul ?? 0;
              const montant = r.montantRetenu ?? 0;
              const dateOp = r.createdAt || new Date().toISOString();

              return (
                <View
                  key={r.id || idx}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={styles.colNum}>{idx + 1}</Text>
                  <Text style={styles.colDate}>{formatPdfDate(dateOp)}</Text>
                  <Text style={styles.colTiers}>{tiers}</Text>
                  <Text style={styles.colIfu}>{ifu}</Text>
                  <Text style={styles.colType}>
                    {isSubie ? "Subie" : "Opérée"}
                  </Text>
                  <Text style={styles.colTaux}>{taux}%</Text>
                  <Text style={styles.colBase}>{formatPdfMoney(base)}</Text>
                  <Text style={styles.colAib}>{formatPdfMoney(montant)}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Bloc Signatures */}
        <View style={styles.signaturesBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>
              Direction Financière / Comptabilité
            </Text>
            <Text style={{ fontSize: 7, color: TEXT_MUTED }}>
              Date et signature du responsable :
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>
              Cachet &amp; Visa de l&apos;Entreprise
            </Text>
            <Text style={{ fontSize: 7, color: TEXT_MUTED }}>
              Certifié sincère et conforme aux écritures comptables :
            </Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text>
            Document édité le {dateEdition} via Nexera ERP • Système certifié e-MECeF
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
