"use client";

import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { TaxContribuable, TaxLiasseFiscale } from "../types/fiscalite.types";
import { formatPdfDate } from "./fiscalitePdfFormat";

const PRIMARY_COLOR = "#047857"; // Emerald Green for Liasse Fiscale
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
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
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
  tableCellPoste: {
    flex: 2.2,
    fontSize: 8.5,
  },
  tableCellNote: {
    flex: 0.6,
    fontSize: 8,
    textAlign: "center",
    color: TEXT_MUTED,
  },
  tableCellBrut: {
    flex: 1.2,
    fontSize: 8.5,
    textAlign: "right",
  },
  tableCellAmort: {
    flex: 1.2,
    fontSize: 8.5,
    textAlign: "right",
  },
  tableCellNet: {
    flex: 1.2,
    fontSize: 8.5,
    textAlign: "right",
    fontWeight: "bold",
  },
  visaCard: {
    borderWidth: 1,
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  visaTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  visaText: {
    fontSize: 8,
    color: "#166534",
  },
  stampBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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

interface LiasseFiscalePdfDocumentProps {
  liasse: TaxLiasseFiscale;
  contribuable?: TaxContribuable | null;
}

export const LiasseFiscalePdfDocument: React.FC<LiasseFiscalePdfDocumentProps> = ({
  liasse,
  contribuable,
}) => {
  return (
    <Document title={`Liasse-Fiscale-${liasse.id.substring(0, 8)}`}>
      <Page size="A4" style={styles.page}>
        {/* Header officiel */}
        <View style={styles.header}>
          <View style={styles.republiqueBlock}>
            <Text style={styles.repText}>RÉPUBLIQUE DU BÉNIN</Text>
            <Text style={styles.ministereText}>
              Système Comptable Ouest Africain (SYSCOHADA Révisé)
            </Text>
            <Text style={styles.dgiText}>
              DIRECTION GÉNÉRALE DES IMPÔTS • ÉTATS FINANCIERS DE SYNTHÈSE
            </Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>
              LIASSE FISCALE ANNUELLE &amp; BILAN NORMALISÉ
            </Text>
            <Text style={styles.docSubTitle}>
              Système : {liasse.typeSystemeComptable.replace(/_/g, " ")} • Date limite de dépôt :{" "}
              {formatPdfDate(liasse.dateLimiteDepot)}
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
                {contribuable?.regimeImposition?.libelle || "Régime Normal"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Centre des Impôts :</Text>
              <Text style={styles.fieldValue}>
                {contribuable?.centreImpotsRattachement || "DGE / CIME"}
              </Text>
            </View>
          </View>

          <View style={styles.contribCol}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Statut Liasse :</Text>
              <Text
                style={{
                  ...styles.fieldValue,
                  color:
                    liasse.statut === "DEPOSEE"
                      ? "#16a34a"
                      : liasse.statut === "VALIDEE"
                      ? "#0284c7"
                      : "#ea580c",
                }}
              >
                {liasse.statut.replace(/_/g, " ")}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Visa Cabinet :</Text>
              <Text style={styles.fieldValue}>
                {liasse.valideParCabinet ? "Apposé (Certifié)" : "En attente de visa"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Génération :</Text>
              <Text style={styles.fieldValue}>
                {formatPdfDate(liasse.dateGeneration)}
              </Text>
            </View>
          </View>
        </View>

        {/* États de synthèse SYSCOHADA (Bilan & Compte de résultat condensé) */}
        <Text style={styles.sectionTitle}>
          1. Bilan Actif Synthétique (SYSCOHADA Révisé)
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableCellPoste]}>
              Postes de l'Actif
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellNote]}>
              Note
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellBrut]}>
              Brut
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellAmort]}>
              Amort. / Prov.
            </Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellNet]}>
              Net (XOF)
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellPoste}>IMMOBILISATIONS INCORPORELLES</Text>
            <Text style={styles.tableCellNote}>3</Text>
            <Text style={styles.tableCellBrut}>—</Text>
            <Text style={styles.tableCellAmort}>—</Text>
            <Text style={styles.tableCellNet}>—</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlternate]}>
            <Text style={styles.tableCellPoste}>IMMOBILISATIONS CORPORELLES</Text>
            <Text style={styles.tableCellNote}>3</Text>
            <Text style={styles.tableCellBrut}>—</Text>
            <Text style={styles.tableCellAmort}>—</Text>
            <Text style={styles.tableCellNet}>—</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellPoste}>ACTIF CIRCULANT (Stocks & Créances)</Text>
            <Text style={styles.tableCellNote}>5-7</Text>
            <Text style={styles.tableCellBrut}>—</Text>
            <Text style={styles.tableCellAmort}>—</Text>
            <Text style={styles.tableCellNet}>—</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlternate]}>
            <Text style={styles.tableCellPoste}>TRÉSORERIE ACTIF (Banques & Caisses)</Text>
            <Text style={styles.tableCellNote}>11</Text>
            <Text style={styles.tableCellBrut}>—</Text>
            <Text style={styles.tableCellAmort}>—</Text>
            <Text style={styles.tableCellNet}>—</Text>
          </View>
        </View>

        {/* Encadré Visa Cabinet d'Expertise */}
        <View style={styles.visaCard}>
          <Text style={styles.visaTitle}>
            ATTESTATION DE CONFORMITÉ &amp; VISA DU CABINET COMPTABLE
          </Text>
          <Text style={styles.visaText}>
            {liasse.valideParCabinet
              ? "Les états financiers ont fait l'objet d'un examen de conformité conformément aux normes de l'Ordre des Experts-Comptables et Comptables Agréés du Bénin (OECCA-Bénin). Le visa et la signature électronique ont été enregistrés avec succès."
              : "Liasse fiscale en cours de supervision par le Cabinet d'expertise comptable agréé."}
          </Text>
        </View>

        {/* Cadre de signatures */}
        <View style={styles.stampBox}>
          <View style={styles.signatureBlock}>
            <Text style={styles.sigTitle}>POUR L'ENTREPRISE DÉCLARANTE</Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginTop: 2 }}>
              Le Dirigeant / Représentant Légal
            </Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.sigTitle}>VISA DE L'EXPERT-COMPTABLE</Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginTop: 2 }}>
              {liasse.valideParCabinet
                ? "Signature numérique certifiée OECCA"
                : "En attente de visa"}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Liasse Fiscale SYSCOHADA Révisé générée par NEXERA ERP • Téléprocédure DGI Bénin
        </Text>
      </Page>
    </Document>
  );
};
