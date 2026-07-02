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
import { orderStatusLabel, normalizeOrderStatus } from "../utils/orderLabels";
import type { OrderPdfContext } from "./orderPdf.types";

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

export function OrderPdfDocument({ ctx }: { ctx: OrderPdfContext }) {
  const { order, tenant, template, mode } = ctx;
  const primaryColor = template.primaryColor || DEFAULT_PRIMARY;
  const styles = createStyles(primaryColor);
  const currency = order.currency;
  const companyName = tenant.tradeName || tenant.legalName || "Entreprise";
  const discountPct = order.discountPct ?? 0;
  const discountAmount = order.subtotalHt * (discountPct / 100);
  const watermark =
    mode === "preview"
      ? normalizeOrderStatus(order.status) === "draft"
        ? "BROUILLON"
        : "APERÇU"
      : null;

  return (
    <Document title={`BC ${order.number}`} author={companyName}>
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
            <Text style={styles.docTitle}>BON DE COMMANDE</Text>
            <Text style={styles.docNumber}>{order.number}</Text>
            <Text style={[styles.docNumber, { marginTop: 2 }]}>
              {orderStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Client</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              {order.client?.companyName ?? "—"}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.row}>
              <Text>Date</Text>
              <Text>{formatPdfDate(order.issueDate)}</Text>
            </View>
            {order.quotation ? (
              <View style={styles.row}>
                <Text>Devis</Text>
                <Text>{order.quotation.number}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colUnit}>PU HT</Text>
            <Text style={styles.colDisc}>Rem.</Text>
            <Text style={styles.colTax}>TVA</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {order.lines.map((line, index) => (
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
                {(line.taxRate?.rate ?? 0).toFixed(1)}%
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
            <Text>{formatPdfMoney(order.subtotalHt, currency)}</Text>
          </View>
          {discountPct > 0 ? (
            <View style={styles.totalRow}>
              <Text>Remise ({discountPct}%)</Text>
              <Text>-{formatPdfMoney(discountAmount, currency)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text>TVA</Text>
            <Text>{formatPdfMoney(order.totalTax, currency)}</Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text>Total TTC</Text>
            <Text>{formatPdfMoney(order.totalTtc, currency)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          {template.footerText ? <Text>{template.footerText}</Text> : null}
        </View>
      </Page>
    </Document>
  );
}
