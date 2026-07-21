import { InvalidAiResponseError, parseAiResponse } from "../../lib/aiResponseValidation";
import { finalizeRoleDiscovery, finalizeVacancyMatch } from "../careerMatchResultService";
import { RoleDiscoveryAi, VacancyMatchAi, roleDiscoveryAiSchema } from "../careerMatchSchemas";

const cvText = `Built scalable
REST APIs for authentication.
Developed React dashboards for customers.
Docker, Jenkins, GitHub Actions
Improved page speed by 40%.`;

const roleAnalysis: RoleDiscoveryAi = {
  mode: "role_discovery",
  inferredProfile: "Full-stack developer with frontend depth",
  roles: [
    {
      title: "Full Stack Developer",
      summary: "Direct full-stack evidence",
      evidenceLevel: "professional",
      fitBreakdown: { professionalExperience: 35, relevantProjects: 22, demonstratedSkills: 18, educationAndTraining: 10 },
      cvEvidence: ["Built scalable REST APIs for authentication."],
      strengths: ["API delivery"],
      gaps: [],
    },
    {
      title: "Frontend Developer",
      summary: "Strong project evidence",
      evidenceLevel: "project",
      fitBreakdown: { professionalExperience: 20, relevantProjects: 24, demonstratedSkills: 18, educationAndTraining: 10 },
      cvEvidence: ["Developed React dashboards for customers."],
      strengths: ["React"],
      gaps: [],
    },
    {
      title: "DevOps Engineer",
      summary: "Skills exposure only",
      evidenceLevel: "skills_only",
      fitBreakdown: { professionalExperience: 30, relevantProjects: 20, demonstratedSkills: 20, educationAndTraining: 10 },
      cvEvidence: ["Docker, Jenkins, GitHub Actions"],
      strengths: ["Tool familiarity"],
      gaps: ["No demonstrated infrastructure ownership"],
    },
  ],
  recommendations: [{
    action: "Add scale to the performance result.",
    evidence: { cvExcerpt: "Improved page speed by 40%.", rationale: "The metric is useful evidence." },
  }],
};

const vacancyAnalysis: VacancyMatchAi = {
  mode: "vacancy_match",
  inferredJobTitle: "Full Stack Developer",
  summary: "Strong match",
  matchBreakdown: { requirementsMatch: 35, relevantExperience: 20, demonstratedSkills: 17, evidenceQuality: 8 },
  matchedRequirements: [{
    requirement: "Build scalable REST APIs",
    cvEvidence: "Built scalable REST APIs for authentication.",
    explanation: "Direct API evidence",
  }],
  partialRequirements: [],
  missingRequirements: [{ requirement: "Operate Kubernetes clusters", explanation: "Not shown in the CV" }],
  recommendations: [{
    action: "Clarify infrastructure ownership.",
    evidence: {
      cvExcerpt: "Docker, Jenkins, GitHub Actions",
      jobRequirement: "Operate Kubernetes clusters",
      rationale: "Tools are listed but cluster operation is not demonstrated.",
    },
  }],
  alternativeRoles: ["Backend Developer"],
};

describe("Career Match score calibration", () => {
  test("2026-07 single-digit legacy scores are rejected", () => {
    const legacyRole = {
      summary: "Evidence-backed role",
      cvEvidence: ["Built scalable REST APIs for authentication."],
      strengths: ["API delivery"],
      gaps: [],
    };
    const legacyResponse = {
      mode: "role_discovery",
      inferredProfile: "Full Stack Developer",
      cvQualityScore: 8,
      roles: [
        { ...legacyRole, title: "Full Stack Developer", fitScore: 9, fitType: "primary" },
        { ...legacyRole, title: "Frontend Developer", fitScore: 8, fitType: "adjacent" },
        { ...legacyRole, title: "DevOps Engineer", fitScore: 6, fitType: "stretch" },
      ],
      recommendations: [{
        action: "Add metrics.",
        evidence: { cvExcerpt: "Improved page speed by 40%.", rationale: "Quantified evidence" },
      }],
    };
    expect(() => parseAiResponse(JSON.stringify(legacyResponse), roleDiscoveryAiSchema)).toThrow(InvalidAiResponseError);
  });

  test("2026-07 provider metadata is stripped from role discovery", () => {
    const providerResponse = {
      ...roleAnalysis,
      providerMetadata: { model: "career-match" },
      roles: roleAnalysis.roles.map((role) => ({ ...role, fitScore: 99 })),
    };

    expect(parseAiResponse(JSON.stringify(providerResponse), roleDiscoveryAiSchema)).toEqual(roleAnalysis);
  });

  test("server ranks roles and caps skills-only evidence", () => {
    const finalized = finalizeRoleDiscovery(roleAnalysis, 78, cvText);
    expect(finalized.cvQualityScore).toBe(78);
    expect(finalized.roles.map((role) => [role.title, role.fitScore, role.fitType])).toEqual([
      ["Full Stack Developer", 85, "primary"],
      ["Frontend Developer", 72, "adjacent"],
      ["DevOps Engineer", 45, "stretch"],
    ]);
  });

  test("citation absent from the CV rejects the analysis", () => {
    const inventedEvidence: RoleDiscoveryAi = {
      ...roleAnalysis,
      roles: [{ ...roleAnalysis.roles[0], cvEvidence: ["Operated Kubernetes in production"] }, ...roleAnalysis.roles.slice(1)],
    };
    expect(() => finalizeRoleDiscovery(inventedEvidence, 78, cvText)).toThrow(InvalidAiResponseError);
  });

  test("vacancy score is the bounded breakdown total", () => {
    const jobDescription = "Build scalable REST APIs. Operate Kubernetes clusters.";
    const finalized = finalizeVacancyMatch(vacancyAnalysis, 78, cvText, jobDescription);
    expect(finalized.jobMatchScore).toBe(80);
    expect(finalized.cvQualityScore).toBe(78);
  });
});
