import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { pdfLangStyle, tp } from "./pdfFont";
import PdfFormattedText from "./PdfFormattedText";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#333",
  },
  section: {
    marginBottom: 15,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottom: "1px solid #ccc",
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  contact: {
    fontSize: 10,
    color: "#555",
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    borderBottom: "1px solid #333",
    paddingBottom: 3,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  entry: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  entryTitle: {
    fontWeight: "bold",
    fontSize: 12,
  },
  entryLocation: {
    fontStyle: "italic",
  },
  entrySubtitle: {
    fontStyle: "italic",
    color: "#444",
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  skillsText: {
    fontSize: 11,
    lineHeight: 1.4,
  },
});

const PdfClassicCV = ({
  name,
  email,
  phone,
  location,
  professionalTitle,
  summary,
  skills,
  experience = [],
  education = [],
  projects = [],
}) => (
  <Document>
    <Page size="A4" style={[styles.page, pdfLangStyle()]}>
      {}
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {professionalTitle && (
          <Text style={styles.title}>{professionalTitle}</Text>
        )}
        <Text style={styles.contact}>
          {[email, phone, location].filter(Boolean).join("  |  ")}
        </Text>
      </View>

      {}
      {summary && (
        <View style={styles.section}>
          <Text style={styles.heading}>{tp('Professional Summary')}</Text>
          <Text style={styles.entryDescription}><PdfFormattedText text={summary} /></Text>
        </View>
      )}

      {}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>{tp('Work Experience')}</Text>
          {experience.map((exp, i) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>
                  {exp.role} at {exp.company}
                </Text>
                <Text style={styles.entryLocation}>{exp.years}</Text>
              </View>
              {exp.location && (
                <Text style={styles.entrySubtitle}>{exp.location}</Text>
              )}
              {exp.description && (
                <Text style={styles.entryDescription}><PdfFormattedText text={exp.description} /></Text>
              )}
            </View>
          ))}
        </View>
      )}

      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>{tp('Projects')}</Text>
          {projects.map((proj, i) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>
                  {proj.name}
                  {proj.technologies ? ` — ${proj.technologies}` : ""}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {proj.demoUrl && <Text style={styles.entryLocation}>{tp('Demo')}</Text>}
                  {proj.githubUrl && <Text style={styles.entryLocation}>GitHub</Text>}
                </View>
              </View>
              {proj.description && (
                <Text style={styles.entryDescription}><PdfFormattedText text={proj.description} /></Text>
              )}
            </View>
          ))}
        </View>
      )}

      {}
      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>{tp('Education')}</Text>
          {education.map((edu, i) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{edu.degree}</Text>
                <Text style={styles.entryLocation}>
                  {edu.startYear} - {edu.endYear}
                </Text>
              </View>
              <Text style={styles.entrySubtitle}>
                {edu.institution}
                {edu.location ? `, ${edu.location}` : ""}
              </Text>
              {edu.description && (
                <Text style={styles.entryDescription}><PdfFormattedText text={edu.description} /></Text>
              )}
            </View>
          ))}
        </View>
      )}

      {}
      {skills && (
        <View style={styles.section}>
          <Text style={styles.heading}>{tp('Skills')}</Text>
          <Text style={styles.skillsText}>{skills}</Text>
        </View>
      )}
    </Page>
  </Document>
);

export default PdfClassicCV;
