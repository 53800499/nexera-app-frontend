"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { quotationStatusLabel } from "../utils/quotationLabels";
import {
  formatCompanyAddress,
  formatPdfDate,
  formatPdfMoney,
} from "./quotationPdfFormat";
import type { QuotationPdfContext } from "./quotationPdf.types";

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
      left: 80,
      transform: "rotate(-35deg)",
    },
    watermark: {
      fontSize: 64,
      color: "#d1d5db",
      letterSpacing: 4,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    companyName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
    companyLine: { fontSize: 9, color: "#6b7280", marginBottom: 2 },
    docTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: primaryColor,
      textAlign: "right",
    },
    docNumber: { fontSize: 11, textAlign: "right", marginTop: 4 },
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
    colDesc: { width: "38%" },
    colQty: { width: "10%", textAlign: "right" },
    colUnit: { width: "14%", textAlign: "right" },
    colDisc: { width: "10%", textAlign: "right" },
    colTax: { width: "10%", textAlign: "right" },
    colTotal: { width: "18%", textAlign: "right" },
    totalsBox: { marginLeft: "auto", width: "45%", marginTop: 8 },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 3,
    },
    totalRowFinal: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: primaryColor,
      fontWeight: "bold",
      fontSize: 11,
    },
    notes: {
      marginTop: 16,
      padding: 10,
      backgroundColor: "#f9fafb",
      fontSize: 9,
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
    metaGrid: { flexDirection: "row", gap: 24, marginBottom: 16 },
    metaBlock: { flex: 1 },
  });
}

function groupTaxByRate(ctx: QuotationPdfContext) {
  const buckets = new Map<number, number>();
  for (const line of ctx.quotation.lines) {
    const rate = line.taxRatePct ?? line.taxRate?.rate ?? 0;
    buckets.set(rate, (buckets.get(rate) ?? 0) + line.taxAmount);
  }
  return [...buckets.entries()].sort(([a], [b]) => a - b);
}

export function QuotationPdfDocument({ ctx }: { ctx: QuotationPdfContext }) {
  const { quotation, tenant, template, mode } = ctx;
  const primaryColor = template.primaryColor || DEFAULT_PRIMARY;
  const styles = createStyles(primaryColor);
  const currency = quotation.currency;
  const companyName = tenant.tradeName || tenant.legalName || "Entreprise";
  const discountPct = quotation.discountPct ?? 0;
  const discountAmount =
    quotation.discountAmount ??
    quotation.subtotalHt * (discountPct / 100);
  const totalHtAfterDiscount = quotation.subtotalHt - discountAmount;
  const taxByRate = groupTaxByRate(ctx);

  return (
    <Document title={`Devis ${quotation.number}`} author={companyName}>
      <Page size="A4" style={styles.page}>
        {mode === "preview" ? (
          <View style={styles.watermarkWrap}>
            <Text style={styles.watermark}>APERÇU</Text>
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
            {tenant.legalName && tenant.tradeName ? (
              <Text style={styles.companyLine}>{tenant.legalName}</Text>
            ) : null}
            <Text style={styles.companyLine}>
              {formatCompanyAddress(tenant.companyAddress)}
            </Text>
            {tenant.siret ? (
              <Text style={styles.companyLine}>SIRET : {tenant.siret}</Text>
            ) : null}
            {tenant.vatNumber ? (
              <Text style={styles.companyLine}>TVA : {tenant.vatNumber}</Text>
            ) : null}
            {tenant.companyEmail ? (
              <Text style={styles.companyLine}>{tenant.companyEmail}</Text>
            ) : null}
            {tenant.companyPhone ? (
              <Text style={styles.companyLine}>{tenant.companyPhone}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.docTitle}>DEVIS</Text>
            <Text style={styles.docNumber}>{quotation.number}</Text>
            <Text style={[styles.docNumber, { marginTop: 2 }]}>
              {quotationStatusLabel(quotation.status)}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Client</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              {quotation.client?.companyName ?? "—"}
            </Text>
            {quotation.client?.code ? (
              <Text style={styles.companyLine}>
                Réf. {quotation.client.code}
              </Text>
            ) : null}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.row}>
              <Text>Date d&apos;émission</Text>
              <Text>{formatPdfDate(quotation.issueDate)}</Text>
            </View>
            {quotation.expiryDate ? (
              <View style={styles.row}>
                <Text>Validité</Text>
                <Text>{formatPdfDate(quotation.expiryDate)}</Text>
              </View>
            ) : null}
            {quotation.paymentTerm ? (
              <View style={styles.row}>
                <Text>Conditions</Text>
                <Text>{quotation.paymentTerm.name}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {template.headerText ? (
          <Text style={{ fontSize: 9, marginBottom: 12 }}>
            {template.headerText}
          </Text>
        ) : null}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colUnit}>PU HT</Text>
            <Text style={styles.colDisc}>Rem.</Text>
            <Text style={styles.colTax}>TVA</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {quotation.lines.map((line, index) => (
            <View
              key={line.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colUnit}>
                {formatPdfMoney(line.unitPriceHt, currency)}
              </Text>
              <Text style={styles.colDisc}>
                {line.discountPct > 0 ? `${line.discountPct}%` : "—"}
              </Text>
              <Text style={styles.colTax}>
                {(line.taxRatePct ?? line.taxRate?.rate ?? 0).toFixed(1)}%
              </Text>
              <Text style={styles.colTotal}>
                {formatPdfMoney(line.lineTotalHt, currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>Sous-total HT</Text>
            <Text>{formatPdfMoney(quotation.subtotalHt, currency)}</Text>
          </View>
          {discountPct > 0 ? (
            <View style={styles.totalRow}>
              <Text>Remise ({discountPct}%)</Text>
              <Text>
                -{formatPdfMoney(discountAmount, currency)}
              </Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text>Total HT</Text>
            <Text>{formatPdfMoney(totalHtAfterDiscount, currency)}</Text>
          </View>
          {taxByRate.map(([rate, amount]) => (
            <View key={rate} style={styles.totalRow}>
              <Text>TVA {rate}%</Text>
              <Text>{formatPdfMoney(amount, currency)}</Text>
            </View>
          ))}
          <View style={styles.totalRowFinal}>
            <Text>Total TTC</Text>
            <Text>{formatPdfMoney(quotation.totalTtc, currency)}</Text>
          </View>
        </View>

        {quotation.notes ? (
          <View style={styles.notes}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Notes</Text>
            <Text>{quotation.notes}</Text>
          </View>
        ) : null}

        {template.legalMentions ||
        template.termsAndConditions ||
        tenant.cgvText ? (
          <View style={{ marginTop: 16, fontSize: 7, color: "#6b7280" }}>
            {template.legalMentions ? (
              <Text>{template.legalMentions}</Text>
            ) : null}
            {template.termsAndConditions ? (
              <Text style={{ marginTop: 4 }}>
                {template.termsAndConditions}
              </Text>
            ) : null}
            {tenant.cgvText ? (
              <Text style={{ marginTop: 4 }}>{tenant.cgvText}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          {template.footerText ? <Text>{template.footerText}</Text> : null}
          {template.showPageNumbers !== false ? (
            <Text
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} / ${totalPages}`
              }
            />
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
