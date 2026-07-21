import { z } from "zod";

const score = z.number().int().min(0).max(100);
const nonEmpty = z.string().trim().min(1);
const ROLE_SCORE_BANDS = {
  primary: { min: 60, max: 100 },
  adjacent: { min: 55, max: 100 },
  stretch: { min: 25, max: 54 },
} as const;

const roleScoreFitsBand = (fitType: keyof typeof ROLE_SCORE_BANDS, fitScore: number): boolean => {
  const band = ROLE_SCORE_BANDS[fitType];
  return fitScore >= band.min && fitScore <= band.max;
};

const roleFitBreakdownSchema = z.object({
  professionalExperience: z.number().int().min(0).max(40),
  relevantProjects: z.number().int().min(0).max(25),
  demonstratedSkills: z.number().int().min(0).max(20),
  educationAndTraining: z.number().int().min(0).max(15),
}).strip();

const roleCandidateSchema = z.object({
  title: nonEmpty,
  summary: nonEmpty,
  evidenceLevel: z.enum(["professional", "project", "training", "skills_only"]),
  fitBreakdown: roleFitBreakdownSchema,
  cvEvidence: z.array(nonEmpty).min(1).max(5),
  strengths: z.array(nonEmpty).min(1).max(5),
  gaps: z.array(nonEmpty).max(5),
}).strip();

const discoveryRecommendationSchema = z.object({
  action: nonEmpty,
  evidence: z.object({ cvExcerpt: nonEmpty, rationale: nonEmpty }).strip(),
}).strip();

const discoveryShape = {
  mode: z.literal("role_discovery"),
  inferredProfile: nonEmpty,
  roles: z.array(roleCandidateSchema).min(3).max(5),
  recommendations: z.array(discoveryRecommendationSchema).min(1).max(6),
};

export const roleDiscoveryAiSchema = z.object(discoveryShape).strip();

export const roleDiscoverySchema = z.object({
  ...discoveryShape,
  cvQualityScore: score,
  roles: z.array(roleCandidateSchema.extend({
    fitScore: score,
    fitType: z.enum(["primary", "adjacent", "stretch"]),
  }).strict()).min(3).max(5),
}).strict().superRefine((analysis, context) => {
  const primaryCount = analysis.roles.filter((role) => role.fitType === "primary").length;
  if (primaryCount !== 1) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["roles"], message: "Exactly one primary role is required." });
  }
  if (analysis.roles[0]?.fitType !== "primary") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["roles", 0, "fitType"], message: "The highest-ranked role must be primary." });
  }
  analysis.roles.forEach((role, index) => {
    if (!roleScoreFitsBand(role.fitType, role.fitScore)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["roles", index, "fitScore"], message: "Role score does not match its evidence band." });
    }
  });
});

const requirementSchema = z.object({
  requirement: nonEmpty,
  cvEvidence: nonEmpty,
  explanation: nonEmpty,
}).strip();

const vacancyRecommendationSchema = z.object({
  action: nonEmpty,
  evidence: z.object({
    cvExcerpt: nonEmpty,
    jobRequirement: nonEmpty,
    rationale: nonEmpty,
  }).strip(),
}).strip();

const vacancyMatchBreakdownSchema = z.object({
  requirementsMatch: z.number().int().min(0).max(45),
  relevantExperience: z.number().int().min(0).max(25),
  demonstratedSkills: z.number().int().min(0).max(20),
  evidenceQuality: z.number().int().min(0).max(10),
}).strip();

const vacancyShape = {
  mode: z.literal("vacancy_match"),
  inferredJobTitle: nonEmpty,
  summary: nonEmpty,
  matchBreakdown: vacancyMatchBreakdownSchema,
  matchedRequirements: z.array(requirementSchema),
  partialRequirements: z.array(requirementSchema),
  missingRequirements: z.array(z.object({ requirement: nonEmpty, explanation: nonEmpty }).strip()),
  recommendations: z.array(vacancyRecommendationSchema),
  alternativeRoles: z.array(nonEmpty),
};

export const vacancyMatchAiSchema = z.object(vacancyShape).strip();
export const vacancyMatchSchema = z.object({
  ...vacancyShape,
  cvQualityScore: score,
  jobMatchScore: score,
}).strict();

const marketSourceSchema = z.object({
  title: nonEmpty,
  url: z.string().url(),
  publishedAt: z.string().nullable(),
}).strip();

export const marketSnapshotSchema = z.object({
  searchedAt: z.string().datetime(),
  signals: z.array(z.object({
    roleTitle: nonEmpty,
    demand: z.enum(["strong", "moderate", "niche"]),
    summary: nonEmpty,
    sources: z.array(marketSourceSchema).min(1).max(5),
  }).strip()).min(1).max(5),
}).strip();

export const careerMatchCachedPayloadSchema = z.object({
  analysis: z.union([roleDiscoverySchema, vacancyMatchSchema]),
  marketSnapshot: marketSnapshotSchema.nullable(),
}).strict();

export type RoleDiscoveryAi = z.infer<typeof roleDiscoveryAiSchema>;
export type VacancyMatchAi = z.infer<typeof vacancyMatchAiSchema>;
export type RoleDiscovery = z.infer<typeof roleDiscoverySchema>;
export type VacancyMatch = z.infer<typeof vacancyMatchSchema>;
export type MarketSnapshot = z.infer<typeof marketSnapshotSchema>;
export type CareerMatchCachedPayload = z.infer<typeof careerMatchCachedPayloadSchema>;
