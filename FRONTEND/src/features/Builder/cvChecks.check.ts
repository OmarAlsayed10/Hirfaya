import assert from "node:assert/strict";
import { runCvChecks } from "./cvChecks.ts";

const ids = (checks: ReturnType<typeof runCvChecks>) => checks.map((check) => check.id).sort();

const strongCv: any = {
  personalInfo: {
    firstName: "Omar", lastName: "Alsayed", email: "omar@example.com", phoneCode: "+20", phone: "1000000000",
    city: "Tanta", professionalTitle: "HSE Officer",
    ProfessionalSummary: "Safety officer with six years running site inspections and incident investigations across construction and industrial projects, cutting recordable incidents year over year.",
  },
  experience: [{
    jobTitle: "HSE Officer", company: "Acme", location: "Tanta", startDate: "2020", endDate: "2024",
    description: "Led 40 toolbox talks per quarter\nReduced recordable incidents by 32%",
  }],
  education: [],
  projects: [],
  skills: { skills: ["OSHA", "IOSH", "Risk Assessment", "Auditing", "Reporting", "Training", "Fire Safety", "Permits"], languages: "", certifications: [] },
};

const order: any = ["personal", "experience", "skills", "education", "projects", "languages", "certifications"];

assert.deepEqual(ids(runCvChecks(strongCv, order, 1, 1)), []);

// 9pt floor: 12 / 14.08 ≈ 0.852.
assert.deepEqual(ids(runCvChecks(strongCv, order, 1, 0.86)), []);
assert.deepEqual(ids(runCvChecks(strongCv, order, 1, 0.84)), ["font-too-small"]);

assert.deepEqual(ids(runCvChecks(strongCv, order, 3, 1)), ["too-many-pages"]);

// Education before experience is the order the analysis marks down.
const badOrder: any = ["personal", "education", "experience", "skills", "projects", "languages", "certifications"];
assert.deepEqual(ids(runCvChecks(strongCv, badOrder, 1, 1)), ["section-order"]);

const weakCv = {
  ...strongCv,
  personalInfo: { ...strongCv.personalInfo, phone: "", ProfessionalSummary: "Safety officer." },
  experience: [{ ...strongCv.experience[0], description: "Responsible for safety on site" }],
  skills: { ...strongCv.skills, skills: ["OSHA"] },
};
assert.deepEqual(
  ids(runCvChecks(weakCv, order, 1, 1)),
  ["missing-contact", "no-numbers", "summary-too-short", "too-few-skills", "weak-verbs"],
);

// The reported false positive: real bullets, inline dashes, verbs the old list did not know.
const realCv: any = {
  ...strongCv,
  experience: [{
    ...strongCv.experience[0],
    description: "- Handled 50+ customer calls daily, providing product information and resolving issues efficiently. - Achieved monthly sales targets and improved customer satisfaction through professional service. - Trained in effective communication, negotiation, and CRM systems for client management.",
  }, {
    jobTitle: "Health Inspector", company: "Preventive Medicine Department", location: "Benha", startDate: "Jul 2025", endDate: "Present",
    description: "- Conducted daily inspections and reports for public health and safety compliance. - Communicated with citizens and medical staff to ensure adherence to preventive health standards. - Implemented infection control measures, monitored environmental health, and coordinated childhood vaccination programs. - Provided administrative support and maintained accurate documentation within the health unit.",
  }],
};
assert.deepEqual(ids(runCvChecks(realCv, order, 1, 1)), []);

console.log("cvChecks ok");
