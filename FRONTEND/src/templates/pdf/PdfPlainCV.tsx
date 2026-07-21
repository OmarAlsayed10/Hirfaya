import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { pdfLangStyle } from "./pdfFont";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a18",
    marginBottom: 4,
    textAlign: "center",
  },
  contact: {
    fontSize: 9,
    color: "#555",
    marginBottom: 8,
    textAlign: "center",
  },
  heading: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a18",
    borderBottomWidth: 1.5,
    borderBottomColor: "#1a1a18",
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginTop: 15,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 6,
    marginBottom: 2,
  },
  entryTitle: {
    fontWeight: "bold",
    fontSize: 10.5,
    color: "#1a1a18",
  },
  entryLocation: {
    fontSize: 9,
    color: "#555",
    fontStyle: "italic",
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
    color: "#333",
  },
  plainText: {
    fontSize: 9.5,
    lineHeight: 1.4,
    color: "#333",
  },
  spacer: {
    height: 6,
  },
});

const SECTION_HEADER_PATTERN = /^[A-Z][A-Z\s&/]{2,}$/;
const SECTION_KEYWORDS =
  /^(professional\s+summary|summary|profile|objective|work\s+experience|experience|employment(\s+history)?|education|technical\s+skills|skills|projects?|certifications?|languages?|courses?|training|participations?|activities|achievements?|key\s+achievements|awards?|honors?|interests?|volunteer(ing)?|publications?|references?|contact|about\s+me)\s*:?\s*$/i;

const isHeader = (line: string) =>
  line.length < 50 && (SECTION_HEADER_PATTERN.test(line) || SECTION_KEYWORDS.test(line));

const isEntryHeader = (line: string) => line.includes(" | ");

const PdfPlainCV = ({ cvText }: { cvText: string }) => {
  const lines = cvText.split("\n");
  let seenName = false;
  let seenContact = false;

  return (
    <Document>
      <Page size="A4" style={[styles.page, pdfLangStyle()]}>
        {lines.map((raw, i) => {
          const line = raw.trim();
          if (!line) return <View key={i} style={styles.spacer} />;

          if (!seenName && !isHeader(line)) {
            seenName = true;
            return (
              <Text key={i} style={styles.name}>
                {line}
              </Text>
            );
          }

          if (!seenContact && !isHeader(line)) {
            seenName = true;
            seenContact = true;
            return (
              <Text key={i} style={styles.contact}>
                {line}
              </Text>
            );
          }

          if (isHeader(line)) {
            seenName = true;
            seenContact = true;
            return (
              <Text key={i} style={styles.heading}>
                {line.replace(/\s*:\s*$/, "").toUpperCase()}
              </Text>
            );
          }

          if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
            return (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bulletText}>{`•  ${line.replace(/^[-•*]\s*/, "")}`}</Text>
              </View>
            );
          }

          if (isEntryHeader(line)) {
            const idx = line.lastIndexOf(" | ");
            return (
              <View key={i} style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{line.slice(0, idx).trim()}</Text>
                <Text style={styles.entryLocation}>{line.slice(idx + 3).trim()}</Text>
              </View>
            );
          }

          return (
            <Text key={i} style={styles.plainText}>
              {line}
            </Text>
          );
        })}
      </Page>
    </Document>
  );
};

export default PdfPlainCV;
