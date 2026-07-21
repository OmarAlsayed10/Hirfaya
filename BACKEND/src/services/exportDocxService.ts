import { Document, Packer, Paragraph, TextRun } from "docx";
import path from "path";
import fs from "fs";

// Replace ICV mongoose interface with a plain type
type CV = {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    professionalTitle: string;
    ProfessionalSummary: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  experience: {
    jobTitle: string;
    company: string;
    location: string;
    startDate: string | Date;
    endDate: string | Date;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    location: string;
    startYear: string | Date;
    endYear: string | Date;
    description: string;
  }[];
  skills: {
    skills?: string[];
    languages?: string | string[];
    certifications?: string | string[];
  };
};

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("default", { month: "short", year: "numeric" });
}

async function exportWordCV(CV: CV): Promise<Buffer> {
  const skillsText = CV.skills?.skills?.join(", ") || "No skills listed";
  const languagesText = Array.isArray(CV.skills?.languages)
    ? CV.skills.languages.join(", ")
    : CV.skills?.languages || "No languages listed";
  const certificationsText = Array.isArray(CV.skills?.certifications)
    ? CV.skills.certifications.join(", ")
    : CV.skills?.certifications || "No certifications listed";

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Personal Information", bold: true, size: 28 }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(`Name: ${CV.personalInfo.firstName} ${CV.personalInfo.lastName}`),
              new TextRun({ break: 1 }),
              new TextRun(`Email: ${CV.personalInfo.email}`),
              new TextRun({ break: 1 }),
              new TextRun(`Phone: ${CV.personalInfo.phone}`),
              new TextRun({ break: 1 }),
              new TextRun(`Location: ${CV.personalInfo.location}`),
              new TextRun({ break: 1 }),
              new TextRun(`Professional Title: ${CV.personalInfo.professionalTitle}`),
              ...(CV.personalInfo.linkedin ? [new TextRun({ break: 1 }), new TextRun(`LinkedIn: ${CV.personalInfo.linkedin}`)] : []),
              ...(CV.personalInfo.github ? [new TextRun({ break: 1 }), new TextRun(`GitHub: ${CV.personalInfo.github}`)] : []),
              ...(CV.personalInfo.portfolio ? [new TextRun({ break: 1 }), new TextRun(`Portfolio: ${CV.personalInfo.portfolio}`)] : []),
              new TextRun({ break: 1 }),
              new TextRun(`Summary: ${CV.personalInfo.ProfessionalSummary}`),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "Experience", bold: true, size: 28 })],
            spacing: { after: 200 },
          }),
          ...CV.experience.map((exp) =>
            new Paragraph({
              children: [
                new TextRun({ text: `${exp.jobTitle} at ${exp.company}`, bold: true }),
                new TextRun({ break: 1 }),
                new TextRun(`Location: ${exp.location}`),
                new TextRun({ break: 1 }),
                new TextRun(`From ${formatDate(exp.startDate)} to ${formatDate(exp.endDate)}`),
                new TextRun({ break: 1 }),
                new TextRun(`Description: ${exp.description}`),
              ],
              spacing: { after: 300 },
            })
          ),

          new Paragraph({
            children: [new TextRun({ text: "Education", bold: true, size: 28 })],
            spacing: { after: 200 },
          }),
          ...CV.education.map((edu) =>
            new Paragraph({
              children: [
                new TextRun({ text: edu.institution, bold: true }),
                new TextRun({ break: 1 }),
                new TextRun(`Degree: ${edu.degree}`),
                new TextRun({ break: 1 }),
                new TextRun(`Location: ${edu.location}`),
                new TextRun({ break: 1 }),
                new TextRun(`From ${formatDate(edu.startYear)} to ${formatDate(edu.endYear)}`),
                new TextRun({ break: 1 }),
                new TextRun(`Description: ${edu.description}`),
              ],
              spacing: { after: 300 },
            })
          ),

          new Paragraph({
            children: [new TextRun({ text: "Skills", bold: true, size: 28 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun(skillsText)],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "Languages", bold: true, size: 28 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun(languagesText)],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "Certifications", bold: true, size: 28 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun(certificationsText)],
            spacing: { after: 400 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

export default exportWordCV;