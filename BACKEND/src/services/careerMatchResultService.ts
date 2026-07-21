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

function vacancyMatchScore(analysis: VacancyMatchAi): number {
  return Object.values(analysis.matchBreakdown).reduce((sum, point) => sum + point, 0);
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
  const parsed = vacancyMatchSchema.safeParse({
    ...analysis,
    cvQualityScore,
    jobMatchScore: vacancyMatchScore(analysis),
  });
  if (!parsed.success) throw new InvalidAiResponseError("The AI returned an uncalibrated vacancy score.");
  return parsed.data;
}