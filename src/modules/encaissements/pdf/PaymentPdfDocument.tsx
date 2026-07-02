"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  formatCompanyAddress,
  formatPdfDate,
  formatPdfMoney,
} from "@/modules/devis/pdf/quotationPdfFormat";
import { paymentMethodLabel } from "../utils/paymentLabels";
import type { PaymentPdfContext } from "./paymentPdf.types";

const DEFAULT_PRIMARY = "#2563eb";

function createStyles(primaryColor: string) {
  return StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#1f2937",
      position: "relative",
    },
    watermarkWrap: {
      position: "absolute",
      top: 280,
      left: 60,
      transform: "rotate(-35deg)",
    },
    watermark: { fontSize: 56, color: "#d1d5db", letterSpacing: 4 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    companyName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
    companyLine: { fontSize: 9, color: "#6b7280", marginBottom: 2 },
    docTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: primaryColor,
      textAlign: "right",
    },
    docRef: { fontSize: 11, textAlign: "right", marginTop: 4 },
    sectionTitle: {
      fontSize: 9,
      fontWeight: "bold",
      color: primaryColor,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 3,
    },
    metaGrid: { flexDirection: "row", gap: 24, marginBottom: 16 },
    metaBlock: { flex: 1 },
    table: { marginTop: 8, marginBottom: 16 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: primaryColor,
      color: "#ffffff",
      padding: 6,
      fontSize: 8,
      fontWeight: "bold",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingVertical: 5,
      paddingHorizontal: 4,
      fontSize: 8,
    },
    tableRowAlt: { backgroundColor: "#f9fafb" },
    colInvoice: { width: "60%" },
    colAmount: { width: "40%", textAlign: "right" },
    summaryBox: {
      marginLeft: "auto",
      width: "50%",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: primaryColor,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    summaryRowFinal: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
      marginTop: 4,
      fontWeight: "bold",
      fontSize: 12,
    },
    notes: {
      marginTop: 16,
      padding: 10,
      backgroundColor: "#f9fafb",
      fontSize: 9,
    },
    cancelBox: {
      marginTop: 12,
      padding: 10,
      backgroundColor: "#fef2f2",
      fontSize: 9,
      color: "#b91c1c",
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      fontSize: 7,
      color: "#9ca3af",
      textAlign: "center",
    },
  });
}

export function PaymentPdfDocument({ ctx }: { ctx: PaymentPdfContext }) {
  const { payment, tenant, template, mode } = ctx;
  const primaryColor = template.primaryColor || DEFAULT_PRIMARY;
  const styles = createStyles(primaryColor);
  const currency = payment.currency;
  const companyName = tenant.tradeName || tenant.legalName || "Entreprise";
  const paymentLabel =
    payment.reference?.trim() || `Réf. ${payment.id.slice(0, 8).toUpperCase()}`;
  const watermark = payment.isCancelled
    ? "ANNULÉ"
    : mode === "preview"
      ? "APERÇU"
      : null;

  return (
    <Document title={`Encaissement ${paymentLabel}`} author={companyName}>
      <Page size="A4" style={styles.page}>
        {watermark ? (
          <View style={styles.watermarkWrap}>
            <Text style={styles.watermark}>{watermark}</Text>
          </View>
        ) : null}

        <View style={styles.header}>
          <View>
            {template.logoUrl ? (
              <Image
                src={template.logoUrl}
                style={{ width: 80, marginBottom: 8 }}
              />
            ) : null}
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.companyLine}>
              {formatCompanyAddress(tenant.companyAddress)}
            </Text>
            {tenant.siret ? (
              <Text style={styles.companyLine}>SIRET : {tenant.siret}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.docTitle}>REÇU D&apos;ENCAISSEMENT</Text>
            <Text style={styles.docRef}>{paymentLabel}</Text>
            <Text style={[styles.docRef, { marginTop: 2 }]}>
              {payment.isCancelled ? "Annulé" : "Actif"}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Client</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              {payment.clientName ?? "—"}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.row}>
              <Text>Date de réception</Text>
              <Text>{formatPdfDate(payment.paymentDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text>Mode de paiement</Text>
              <Text>{paymentMethodLabel(payment.paymentMethod)}</Text>
            </View>
            {payment.exchangeRate !== 1 ? (
              <View style={styles.row}>
                <Text>Taux de change</Text>
                <Text>{payment.exchangeRate}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRowFinal}>
            <Text>Montant reçu</Text>
            <Text>{formatPdfMoney(payment.amount, currency)}</Text>
          </View>
          {payment.unallocatedAmount > 0 ? (
            <View style={styles.summaryRow}>
              <Text>Avance non imputée</Text>
              <Text>
                {formatPdfMoney(payment.unallocatedAmount, currency)}
              </Text>
            </View>
          ) : null}
          {payment.exchangeGainLoss ? (
            <View style={styles.summaryRow}>
              <Text>Écart de change</Text>
              <Text>
                {formatPdfMoney(payment.exchangeGainLoss, currency)}
              </Text>
            </View>
          ) : null}
        </View>

        {payment.imputations.length > 0 ? (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Imputations sur factures</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colInvoice}>Facture</Text>
              <Text style={styles.colAmount}>Montant imputé</Text>
            </View>
            {payment.imputations.map((row, index) => (
              <View
                key={row.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={styles.colInvoice}>
                  {row.invoiceNumber ?? row.invoiceId}
                </Text>
                <Text style={styles.colAmount}>
                  {formatPdfMoney(row.amount, currency)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {payment.advanceCreated ? (
          <View style={styles.notes}>
            <Text>
              Avance client créée :{" "}
              {formatPdfMoney(
                payment.advanceCreated.remainingAmount,
                payment.advanceCreated.currency,
              )}
            </Text>
          </View>
        ) : null}

        {payment.notes ? (
          <View style={styles.notes}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Notes</Text>
            <Text>{payment.notes}</Text>
          </View>
        ) : null}

        {payment.isCancelled && payment.cancelReason ? (
          <View style={styles.cancelBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
              Annulation
            </Text>
            <Text>
              {payment.cancelledAt
                ? `Annulé le ${formatPdfDate(payment.cancelledAt)} — `
                : ""}
              Motif : {payment.cancelReason}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          {template.footerText ? <Text>{template.footerText}</Text> : null}
          <Text>
            Document généré le {formatPdfDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
