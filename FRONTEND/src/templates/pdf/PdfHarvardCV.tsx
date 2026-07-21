import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { pdfLangStyle, tp } from "./pdfFont";
import PdfFormattedText from "./PdfFormattedText";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: "#000",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 10,
    textAlign: "center",
  },
  name: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    color: "#000",
    marginBottom: 3,
  },
  contact: {
    fontSize: 9,
    color: "#000",
  },
  heading: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingBottom: 1,
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  entry: {
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: {
    fontFamily: "Times-Bold",
    fontSize: 10,
    color: "#000",
  },
  entryRight: {
    fontFamily: "Times-Bold",
    fontSize: 9.5,
    color: "#000",
  },
  entrySubtitle: {
    fontFamily: "Times-Italic",
    fontSize: 9.5,
    color: "#000",
  },
  bulletList: {
    paddingLeft: 10,
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
    color: "#000",
  },
  plainText: {
    fontSize: 9.5,
    lineHeight: 1.35,
    color: "#000",
  },
  label: {
    fontFamily: "Times-Bold",
  },
});

function Bullets({ text }: { text: string }) {
  if (!text) return null;
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <Text style={styles.plainText}><PdfFormattedText text={text} /></Text>;
  }

  return (
    <View style={styles.bulletList}>
      {lines.map((l, i) => (
        <View key={i} style={styles.bulletItem}>
          <Text style={styles.bulletText}>•  <PdfFormattedText text={l} fontSize={9} /></Text>
        </View>
      ))}
    </View>
  );
}

function EntryHeader({ left, right, subLeft, subRight }: { left: string; right?: string; subLeft?: string; subRight?: string }) {
  return (
    <View>
      <View style={styles.rowBetween}>
        <Text style={styles.entryTitle}>{left}</Text>
        {right ? <Text style={styles.entryRight}>{right}</Text> : null}
      </View>
      {subLeft || subRight ? (
        <View style={styles.rowBetween}>
          <Text style={styles.entrySubtitle}>{subLeft}</Text>
          {subRight ? <Text style={styles.entrySubtitle}>{subRight}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const PdfHarvardCV = ({
  name,
  email,
  phone,
  location,
  linkedin,
  summary,
  skills,
  languages = [],
  certifications = [],
  experience = [],
  education = [],
  projects = [],
}: any) => {
  const contact = [location, phone, email, linkedin].filter(Boolean).join("  •  ");

  return (
    <Document>
      <Page size="A4" style={[styles.page, pdfLangStyle()]}>
        <View style={styles.header}>
          <Text style={styles.name}>{name || "Your Name"}</Text>
          {contact ? <Text style={styles.contact}>{contact}</Text> : null}
        </View>

        {summary ? (
          <View>
            <Text style={styles.heading}>{tp('Summary')}</Text>
            <Text style={styles.plainText}><PdfFormattedText text={summary} /></Text>
          </View>
        ) : null}

        {education.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Education')}</Text>
            {education.map((edu: any, i: number) => (
              <View key={i} style={styles.entry}>
                <EntryHeader
                  left={edu.institution}
                  right={edu.location}
                  subLeft={edu.degree}
                  subRight={[edu.startYear, edu.endYear].filter(Boolean).join(" – ")}
                />
                <Bullets text={edu.description} />
              </View>
            ))}
          </View>
        ) : null}

        {experience.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Experience')}</Text>
            {experience.map((exp: any, i: number) => (
              <View key={i} style={styles.entry}>
                <EntryHeader left={exp.company} right={exp.location} subLeft={exp.role} subRight={exp.years} />
                <Bullets text={exp.description} />
              </View>
            ))}
          </View>
        ) : null}

        {projects.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Projects')}</Text>
            {projects.map((proj: any, i: number) => (
              <View key={i} style={styles.entry}>
                <EntryHeader left={proj.name} right={proj.technologies} />
                <Bullets text={proj.description} />
              </View>
            ))}
          </View>
        ) : null}

        {skills || languages.length > 0 || certifications.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Skills')}</Text>
            {skills ? (
              <Text style={styles.plainText}>
                <Text style={styles.label}>{tp('Technical')}: </Text>{skills}
              </Text>
            ) : null}
            {languages.length > 0 ? (
              <Text style={styles.plainText}>
                <Text style={styles.label}>{tp('Languages')}: </Text>{languages.map((l: any) => l.name).join(", ")}
              </Text>
            ) : null}
            {certifications.length > 0 ? (
              <Text style={styles.plainText}>
                <Text style={styles.label}>{tp('Certifications')}: </Text>{certifications.map((c: any) => c.name).join(", ")}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export default PdfHarvardCV;
