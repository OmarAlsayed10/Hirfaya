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
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 12,
    textAlign: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a18",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: "#555",
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
  entry: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
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
  entrySubtitle: {
    fontSize: 9,
    color: "#777",
    marginBottom: 3,
  },
  bulletList: {
    paddingLeft: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
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

const PdfJakeCV = ({
  name,
  email,
  phone,
  location,
  professionalTitle,
  linkedin,
  summary,
  skills,
  languages = [],
  certifications = [],
  experience = [],
  education = [],
  projects = [],
}: any) => {
  const contact = [phone, email, linkedin, location, professionalTitle].filter(Boolean).join("  |  ");

  return (
    <Document>
      <Page size="A4" style={[styles.page, pdfLangStyle()]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{name || "Your Name"}</Text>
          {contact ? <Text style={styles.contact}>{contact}</Text> : null}
        </View>

        {/* Summary */}
        {summary ? (
          <View>
            <Text style={styles.heading}>{tp('Summary')}</Text>
            <Text style={styles.plainText}><PdfFormattedText text={summary} /></Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Experience')}</Text>
            {experience.map((exp: any, i: number) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {exp.role}{exp.company ? ` — ${exp.company}` : ""}
                  </Text>
                  <Text style={styles.entryLocation}>{exp.years}</Text>
                </View>
                {exp.location ? (
                  <Text style={styles.entrySubtitle}>{exp.location}</Text>
                ) : null}
                <Bullets text={exp.description} />
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {projects.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Projects')}</Text>
            {projects.map((proj: any, i: number) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {proj.name}{proj.technologies ? ` — ${proj.technologies}` : ""}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {proj.demoUrl ? (
                      <Text style={styles.entryLocation}>{tp('Demo')}</Text>
                    ) : null}
                    {proj.githubUrl ? (
                      <Text style={styles.entryLocation}>GitHub</Text>
                    ) : null}
                  </View>
                </View>
                <Bullets text={proj.description} />
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {education.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Education')}</Text>
            {education.map((edu: any, i: number) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {edu.degree}{edu.institution ? ` — ${edu.institution}` : ""}
                  </Text>
                  <Text style={styles.entryLocation}>
                    {[edu.startYear, edu.endYear].filter(Boolean).join(" – ")}
                  </Text>
                </View>
                {edu.location ? (
                  <Text style={styles.entrySubtitle}>{edu.location}</Text>
                ) : null}
                <Bullets text={edu.description} />
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {skills ? (
          <View>
            <Text style={styles.heading}>{tp('Skills')}</Text>
            <Text style={styles.plainText}>{skills}</Text>
          </View>
        ) : null}

        {/* Languages */}
        {languages.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Languages')}</Text>
            <Text style={styles.plainText}>
              {languages.map((l: any) => l.name).join(", ")}
            </Text>
          </View>
        ) : null}

        {/* Certifications */}
        {certifications.length > 0 ? (
          <View>
            <Text style={styles.heading}>{tp('Certifications')}</Text>
            <Text style={styles.plainText}>
              {certifications.map((c: any) => c.name).join(", ")}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export default PdfJakeCV;
