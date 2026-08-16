import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { pdfLangStyle } from "./pdfFont";
import {
  collapseSkillBullets,
  isContactLine,
  matchSubLabel,
  splitEntryHeader,
  splitHeaderLine,
} from "./plainCvLines";

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
  role: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a18",
    letterSpacing: 0.2,
    marginBottom: 3,
    textAlign: "center",
  },
  contact: {
    fontSize: 9,
    color: "#555",
    marginBottom: 8,
    textAlign: "center",
  },
  subLabel: {
    fontWeight: "bold",
    color: "#1a1a18",
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
  // Without these the two sides size to their content and draw over each other — a long project
  // title opposite a long technology list overlapped into unreadable text.
  entryTitle: {
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
    fontWeight: "bold",
    fontSize: 10.5,
    color: "#1a1a18",
  },
  entryLocation: {
    flexShrink: 0,
    maxWidth: "40%",
    textAlign: "right",
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

const PdfPlainCV = ({ cvText }: { cvText: string }) => {
  const lines = collapseSkillBullets(cvText.split("\n"));
  let seenName = false;
  let seenRole = false;
  let seenContact = false;

  return (
    <Document>
      <Page size="A4" style={[styles.page, pdfLangStyle()]}>
        {lines.map((raw, i) => {
          const line = raw.trim();
          if (!line) return <View key={i} style={styles.spacer} />;

          if (!seenName && !isHeader(line)) {
            seenName = true;
            // The optimizer often returns name, role and every contact fact on one line. Only the
            // name belongs in name styling; the rest is the contact line.
            const header = splitHeaderLine(line);
            if (header) {
              seenRole = true;
              seenContact = true;
              return (
                <View key={i}>
                  <Text style={styles.name}>{header.name}</Text>
                  <Text style={styles.contact}>{header.rest}</Text>
                </View>
              );
            }
            return (
              <Text key={i} style={styles.name}>
                {line}
              </Text>
            );
          }

          if (!seenRole && !seenContact && !isHeader(line) && !isContactLine(line)) {
            seenRole = true;
            return (
              <Text key={i} style={styles.role}>
                {line}
              </Text>
            );
          }

          if (!seenContact && !isHeader(line)) {
            seenName = true;
            seenRole = true;
            seenContact = true;
            return (
              <Text key={i} style={styles.contact}>
                {line}
              </Text>
            );
          }

          if (isHeader(line)) {
            seenName = true;
            seenRole = true;
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

          const entry = splitEntryHeader(line);
          if (entry) {
            return (
              <View key={i} style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryLocation}>{entry.aside}</Text>
              </View>
            );
          }

          const subLabel = matchSubLabel(line);
          if (subLabel) {
            return (
              <Text key={i} style={styles.plainText}>
                <Text style={styles.subLabel}>{`${subLabel.label}: `}</Text>
                {subLabel.rest}
              </Text>
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
