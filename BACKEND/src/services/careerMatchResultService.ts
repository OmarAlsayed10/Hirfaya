import { InvalidAiResponseError } from "../lib/aiResponseValidation";
import {
  RoleDiscovery,
  RoleDiscoveryAi,
  VacancyMatch,
  VacancyMatchAi,
  missingRequirementSchema,
  roleDiscoverySchema,
  vacancyRequirementSchema,
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
  if (sourceIncludesEvidence(source, excerpt)) return;
  throw new InvalidAiResponseError("source_evidence_mismatch", "The AI cited evidence that is absent from the source document.");
}

export function sourceIncludesEvidence(source: string, excerpt: string): boolean {
  const normalizedSource = normalizedEvidence(source);
  const normalizedExcerpt = normalizedEvidence(excerpt);
  if (normalizedExcerpt && normalizedSource.includes(normalizedExcerpt)) return true;

  const sourceWords = new Set(normalizedSource.split(" ").filter(Boolean));
  const excerptWords = normalizedExcerpt.split(" ").filter(Boolean);
  const matchedWords = excerptWords.filter((word) => sourceWords.has(word)).length;
  return Boolean(excerptWords.length) && matchedWords / excerptWords.length >= 0.7;
}
function roleFitScore(role: RoleDiscoveryAi["roles"][number]): number {
  const points = Object.values(role.fitBreakdown).reduce((sum, point) => sum + point, 0);
  return Math.min(points, EVIDENCE_SCORE_CAP[role.evidenceLevel]);
}

function roleFitType(index: number, fitScore: number): "primary" | "adjacent" | "stretch" {
  if (index === 0) return "primary";
  return fitScore >= 55 ? "adjacent" : "stretch";
}

function pruneRoleEvidence(analysis: RoleDiscoveryAi, cvText: string): RoleDiscoveryAi {
  const roles = analysis.roles
    .map((role) => ({ ...role, cvEvidence: role.cvEvidence.filter((excerpt) => sourceIncludesEvidence(cvText, excerpt)) }))
    .filter((role) => role.cvEvidence.length);
  const recommendations = analysis.recommendations.filter(({ evidence }) => sourceIncludesEvidence(cvText, evidence.cvExcerpt));
  if (roles.length < 3) {
    throw new InvalidAiResponseError("source_evidence_mismatch", "The AI cited evidence that is absent from the source document.");
  }
  return { ...analysis, roles, recommendations };
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
  rawAnalysis: RoleDiscoveryAi,
  cvQualityScore: number,
  cvText: string,
): RoleDiscovery {
  const analysis = pruneRoleEvidence(rawAnalysis, cvText);
  const rankedRoles = analysis.roles
    .map((role) => ({ ...role, fitScore: roleFitScore(role) }))
    .sort((left, right) => right.fitScore - left.fitScore)
    .map((role, index) => ({ ...role, fitType: roleFitType(index, role.fitScore) }));
  const parsed = roleDiscoverySchema.safeParse({ ...analysis, roles: rankedRoles, cvQualityScore });
  if (!parsed.success) {
    console.error("[career-match] role discovery calibration failed:", {
      cvQualityScore,
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code, message: issue.message })),
    });
    throw new InvalidAiResponseError("uncalibrated_result", "The AI returned uncalibrated role scores.");
  }
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
    reviewNeededRequirements: [],
    cvQualityScore,
    jobMatchScore,
    matchBreakdown,
    screeningRisk: screeningRisk(analysis),
    scoreLabel: scoreLabel(jobMatchScore),
  });
  if (!parsed.success) {
    console.error("[career-match] vacancy calibration failed:", {
      cvQualityScore,
      jobMatchScore,
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code, message: issue.message })),
    });
    throw new InvalidAiResponseError("uncalibrated_result", "The AI returned an uncalibrated vacancy score.");
  }
  return parsed.data;
}
type ReviewNeededRequirement = VacancyMatch["reviewNeededRequirements"][number];

const objectRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

const objectEntries = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

const nonEmptyText = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

function recoverVerifiedRequirement(entry: unknown, cvText: string, jobDescription: string) {
  const parsed = vacancyRequirementSchema.safeParse(entry);
  if (!parsed.success) return null;
  const requirement = parsed.data;
  return sourceIncludesEvidence(cvText, requirement.cvEvidence)
    && sourceIncludesEvidence(jobDescription, requirement.requirement) ? requirement : null;
}

function recoverMissingRequirement(entry: unknown, jobDescription: string) {
  const parsed = missingRequirementSchema.safeParse(entry);
  return parsed.success && sourceIncludesEvidence(jobDescription, parsed.data.requirement) ? parsed.data : null;
}

function recoverReviewNeededRequirement(entry: unknown, jobDescription: string): ReviewNeededRequirement | null {
  const requirement = nonEmptyText(objectRecord(entry)?.requirement);
  return requirement && sourceIncludesEvidence(jobDescription, requirement)
    ? { requirement, note: "The AI did not provide verifiable CV evidence for this requirement." } : null;
}

export function recoverVacancyMatch(
  providerResponse: unknown,
  cvQualityScore: number,
  cvText: string,
  jobDescription: string,
  targetJobTitle: string,
): VacancyMatch {
  const rawAnalysis = objectRecord(providerResponse);
  if (!rawAnalysis) throw new InvalidAiResponseError("invalid_shape");
  const matchedSource = objectEntries(rawAnalysis.matchedRequirements);
  const partialSource = objectEntries(rawAnalysis.partialRequirements);
  const matchedRequirements = matchedSource.flatMap((entry) => recoverVerifiedRequirement(entry, cvText, jobDescription) || []);
  const partialRequirements = partialSource.flatMap((entry) => recoverVerifiedRequirement(entry, cvText, jobDescription) || []);
  const missingRequirements = objectEntries(rawAnalysis.missingRequirements)
    .flatMap((entry) => recoverMissingRequirement(entry, jobDescription) || []);
  const reviewNeededRequirements = [...matchedSource, ...partialSource]
    .filter((entry) => !recoverVerifiedRequirement(entry, cvText, jobDescription))
    .flatMap((entry) => recoverReviewNeededRequirement(entry, jobDescription) || []);
  if (!matchedRequirements.length && !partialRequirements.length && !missingRequirements.length && !reviewNeededRequirements.length) {
    throw new InvalidAiResponseError("invalid_shape");
  }
  const recoveredAnalysis: VacancyMatchAi = {
    mode: "vacancy_match",
    inferredJobTitle: targetJobTitle || "Vacancy comparison",
    summary: "This is a best-effort comparison based only on verified evidence.",
    matchedRequirements,
    partialRequirements,
    missingRequirements,
    recommendations: [],
    alternativeRoles: [],
  };
  const finalized = finalizeVacancyMatch(recoveredAnalysis, cvQualityScore, cvText, jobDescription);
  return { ...finalized, reviewNeededRequirements };
}