"use client";

import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { AuthUser } from "../types/auth.types";
import { getUserDisplayName } from "../types/user.types";
import { USER_ROLE_LABELS } from "../constants/roles";

const styles = StyleSheet.create({
  page: { padding: 32 },
  title: { fontSize: 18, marginBottom: 16, fontWeight: "bold" },
  line: { fontSize: 11, marginBottom: 8 },
});

function SessionPdfDocument({ user }: { user: AuthUser }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>Fiche d&apos;accès NEXERA</Text>
          <Text style={styles.line}>Nom : {getUserDisplayName(user)}</Text>
          <Text style={styles.line}>E-mail : {user.email}</Text>
          <Text style={styles.line}>
            Profil : {USER_ROLE_LABELS[user.role]}
          </Text>
          <Text style={styles.line}>Espace : {user.workspace}</Text>
          <Text style={styles.line}>
            Date : {new Date().toLocaleString("fr-FR")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export function AuthSessionPdfDocument({ user }: { user: AuthUser }) {
  return (
    <PDFDownloadLink
      document={<SessionPdfDocument user={user} />}
      fileName="nexera-fiche-acces.pdf"
      className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400"
    >
      {({ loading }) =>
        loading ? "Génération PDF..." : "Télécharger ma fiche d'accès (PDF)"
      }
    </PDFDownloadLink>
  );
}
