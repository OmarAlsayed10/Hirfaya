import { InvalidAiResponseError } from "../lib/aiResponseValidation";
import {
  RoleDiscovery,
  RoleDiscoveryAi,
  VacancyMatch,
  VacancyMatchAi,
  roleDiscoverySchema,
  vacancyMatchSchema,
} from "./careerMatchSchemas";

const EVIDENCE_SCORE_CAP = {
  professional: 100,
  project: 85,
  training: 65,
  skills_only: 45,
} as const;

const normalizedEvidence = (text: string): string => text
  .normalize("NFKC")
  .toLowerCase()
  .replace(/([\p{L}\p{N}])-\s*\r?\n\s*([\p{L}\p{N}])/gu, "$1$2")
  .replace(/[^\p{L}\p{N}+#.%]+/gu, " ")
  .replace(/\s+/g, " ")
  .trim();

function requireSourceEvidence(source: string, excerpt: string): void {
  const normalizedSource = normalizedEvidence(source);
  const normalizedExcerpt = normalizedEvidence(excerpt);
  if (normalizedExcerpt && normalizedSource.includes(normalizedExcerpt)) return;

  const sourceWords = new Set(normalizedSource.split(" ").filter(Boolean));
  const excerptWords = normalizedExcerpt.split(" ").filter(Boolean);
  const matchedWords = excerptWords.filter((word) => sourceWords.has(word)).length;
  if (!excerptWords.length || matchedWords / excerptWords.length < 0.7) {
    throw new InvalidAiResponseError("The AI cited evidence that is absent from the source document.");
  }
}

function roleFitScore(role: RoleDiscoveryAi["roles"][number]): number {
  const points = Object.values(role.fitBreakdown).reduce((sum, point) => sum + point, 0);
  return Math.min(points, EVIDENCE_SCORE_CAP[role.evidenceLevel]);
}

function roleFitType(index: number, fitScore: number): "primary" | "adjacent" | "stretch" {
  if (index === 0) return "primary";
  return fitScore >= 55 ? "adjacent" : "stretch";
}

function requireRoleEvidence(analysis: RoleDiscoveryAi, cvText: string): void {
  analysis.roles.forEach((role) => role.cvEvidence.forEach((excerpt) => requireSourceEvidence(cvText, excerpt)));
  analysis.recommendations.forEach(({ evidence }) => requireSourceEvidence(cvText, evidence.cvExcerpt));
}

function requireVacancyEvidence(analysis: VacancyMatchAi, cvText: string, jobDescription: string): void {
  [...analysis.matchedRequirements, ...analysis.partialRequirements].forEach((requirement) => {
    requireSourceEvidence(cvText, requirement.cvEvidence);
    requireSourceEvidence(jobDescription, requirement.requirement);
  });
  analysis.missingRequirements.forEach(({ requirement }) => requireSourceEvidence(jobDescription, requirement));
  analysis.recommendations.forEach(({ evidence }) => {
    requireSourceEvidence(cvText, evidence.cvExcerpt);
    requireSourceEvidence(jobDescription, evidence.jobRequirement);
  });
}

type VacancyRequirement = VacancyMatchAi["matchedRequirements"][number];
type RequirementCategory = VacancyRequirement["category"];

const requirementWeight = (priority: VacancyRequirement["priority"]): number =>
  priority === "must_have" ? 2 : 1;

function requirementRatio(analysis: VacancyMatchAi, category?: RequirementCategory): number {
  const matched = analysis.matchedRequirements.filter((entry) => !category || entry.category === category);
  const partial = analysis.partialRequirements.filter((entry) => !category || entry.category === category);
  const missing = analysis.missingRequirements.filter((entry) => !category || entry.category === category);
  const possible = [...matched, ...partial, ...missing]
    .reduce((sum, entry) => sum + requirementWeight(entry.priority), 0);
  if (!possible) return category ? requirementRatio(analysis) : 0;
  const earned = matched.reduce((sum, entry) => sum + requirementWeight(entry.priority), 0)
    + partial.reduce((sum, entry) => sum + requirementWeight(entry.priority) * 0.5, 0);
  return earned / possible;
}

function evidenceRatio(analysis: VacancyMatchAi): number {
  const strength = { professional: 1, project: 0.8, training: 0.6, skills_only: 0.35 } as const;
  const evidenced = [...analysis.matchedRequirements, ...analysis.partialRequirements];
  if (!evidenced.length) return 0;
  return evidenced.reduce((sum, entry) => sum + strength[entry.evidenceLevel], 0) / evidenced.length;
}

function vacancyMatchBreakdown(analysis: VacancyMatchAi): VacancyMatch["matchBreakdown"] {
  return {
    requirementsMatch: Math.round(requirementRatio(analysis) * 45),
    relevantExperience: Math.round(requirementRatio(analysis, "experience") * 25),
    demonstratedSkills: Math.round(requirementRatio(analysis, "skill") * 20),
    evidenceQuality: Math.round(evidenceRatio(analysis) * 10),
  };
}

function screeningRisk(analysis: VacancyMatchAi): VacancyMatch["screeningRisk"] {
  if (analysis.missingRequirements.some((entry) => entry.priority === "must_have")) return "high";
  if (analysis.partialRequirements.some((entry) => entry.priority === "must_have")) return "medium";
  return "low";
}

function vacancyMatchScore(analysis: VacancyMatchAi, breakdown: VacancyMatch["matchBreakdown"]): number {
  const rawScore = Object.values(breakdown).reduce((sum, point) => sum + point, 0);
  const missingEligibility = analysis.missingRequirements.some(
    (entry) => entry.priority === "must_have" && entry.category === "eligibility",
  );
  if (missingEligibility) return Math.min(rawScore, 49);
  if (screeningRisk(analysis) === "high") return Math.min(rawScore, 69);
  return rawScore;
}

function scoreLabel(score: number): VacancyMatch["scoreLabel"] {
  if (score >= 80) return "strong_evidence_match";
  if (score >= 55) return "partial_evidence_match";
  return "low_evidence_match";
}

export function finalizeRoleDiscovery(
  analysis: RoleDiscoveryAi,
  cvQualityScore: number,
  cvText: string,
): RoleDiscovery {
  requireRoleEvidence(analysis, cvText);
  const rankedRoles = analysis.roles
    .map((role) => ({ ...role, fitScore: roleFitScore(role) }))
    .sort((left, right) => right.fitScore - left.fitScore)
    .map((role, index) => ({ ...role, fitType: roleFitType(index, role.fitScore) }));
  const parsed = roleDiscoverySchema.safeParse({ ...analysis, roles: rankedRoles, cvQualityScore });
  if (!parsed.success) throw new InvalidAiResponseError("The AI returned uncalibrated role scores.");
  return parsed.data;
}

export function finalizeVacancyMatch(
  analysis: VacancyMatchAi,
  cvQualityScore: number,
  cvText: string,
  jobDescription: string,
): VacancyMatch {
  requireVacancyEvidence(analysis, cvText, jobDescription);
  const matchBreakdown = vacancyMatchBreakdown(analysis);
  const jobMatchScore = vacancyMatchScore(analysis, matchBreakdown);
  const parsed = vacancyMatchSchema.safeParse({
    ...analysis,
    cvQualityScore,
    jobMatchScore,
    matchBreakdown,
    screeningRisk: screeningRisk(analysis),
    scoreLabel: scoreLabel(jobMatchScore),
  });
  if (!parsed.success) throw new InvalidAiResponseError("The AI returned an uncalibrated vacancy score.");
  return parsed.data;
}