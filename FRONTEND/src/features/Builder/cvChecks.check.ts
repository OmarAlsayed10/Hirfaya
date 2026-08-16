import assert from "node:assert/strict";
import { detectDateStyles, hasWeakBullets, preferredSectionOrder, runCvChecks, spellOutCvDates } from "./cvChecks.ts";

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
assert.deepEqual(
  preferredSectionOrder(badOrder),
  ["personal", "experience", "skills", "education", "projects", "languages", "certifications"],
);

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
assert.equal(hasWeakBullets(weakCv.experience[0].description), true);
assert.equal(hasWeakBullets(strongCv.experience[0].description), false);

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
// Only one of its seven bullets carries a number, so the quantification tip is correct here; what
// must not appear is weak-verbs.
assert.deepEqual(ids(runCvChecks(realCv, order, 1, 1)), ["no-numbers"]);

// "Boosted" is a real verb the fixed list never held — the -ed fallback is what covers it.
const retailCv: any = {
  ...strongCv,
  experience: [{
    ...strongCv.experience[0],
    description: [
      "* Delivered exceptional retail experiences, elevating customer satisfaction in a fast-paced environment.",
      "* Boosted monthly sales by 10% through strategic upselling and cross-selling techniques.",
      "* Optimized store operations, achieving efficient management of inventory, merchandising, and point-of-sale transactions.",
      "* Streamlined sales processes, resulting in enhanced customer engagement and sales growth.",
    ].join("\n"),
  }],
};
assert.deepEqual(ids(runCvChecks(retailCv, order, 1, 1)), ["no-numbers"]);

// The real CV the analysis marked 47 for Impact: 14 bullets, 2 with a number, and an education
// entry dated 10/2020 among spelled-out job dates. Both slipped past the builder untouched.
const reportedCv: any = {
  ...strongCv,
  experience: [
    {
      jobTitle: "Freelance Insurance Broker", company: "Insurance Brokerage Firm", location: "Tanta",
      startDate: "2023", endDate: "Present",
      description: [
        "Assisted clients in selecting suitable insurance policies by assessing needs.",
        "Negotiated with providers to secure competitive offers for clients.",
        "Built and maintained strong client relationships, resulting in repeat business.",
      ].join("\n"),
    },
    {
      jobTitle: "Sales Associate", company: "Tag Store", location: "Tanta",
      startDate: "Aug 2025", endDate: "Dec 2025",
      description: "Managed sales operations in a large retail store selling home products.",
    },
  ],
  education: [{ institution: "Tanta University", degree: "Bachelor of Law", location: "Tanta", startYear: "10/2020", endYear: "06/2024", description: "" }],
};
assert.deepEqual(ids(runCvChecks(reportedCv, order, 1, 1)), ["mixed-dates", "no-numbers"]);

assert.deepEqual(detectDateStyles(reportedCv), ["spelled-out", "numeric"]);
// Clicking the suggestion has to open the section the odd date is actually in.
assert.equal(runCvChecks(reportedCv, order, 1, 1).find((c) => c.id === "mixed-dates")?.section, "education");
const spelled = spellOutCvDates(reportedCv);
assert.equal(spelled.education[0].startYear, "Oct 2020");
assert.equal(spelled.education[0].endYear, "Jun 2024");
// A plain year, a word and an already-spelled date all survive untouched.
assert.equal(spelled.experience[0].startDate, "2023");
assert.equal(spelled.experience[0].endDate, "Present");
assert.equal(spelled.experience[1].startDate, "Aug 2025");
assert.deepEqual(detectDateStyles(spelled), ["spelled-out"]);

// Half the bullets carrying a number is the threshold the analysis starts deducting at.
const halfQuantified: any = {
  ...strongCv,
  experience: [{ ...strongCv.experience[0], description: "Led 40 toolbox talks per quarter\nReduced recordable incidents\nCut lost-time injuries 32%\nTrained the site crew" }],
};
assert.deepEqual(ids(runCvChecks(halfQuantified, order, 1, 1)), []);

// Duty phrasing that happens to end in -ed stays weak.
assert.equal(hasWeakBullets("Worked on the sales floor"), true);
assert.equal(hasWeakBullets("Helped customers find products"), true);
assert.equal(hasWeakBullets("Revitalized the loyalty programme"), false);

console.log("cvChecks ok");
