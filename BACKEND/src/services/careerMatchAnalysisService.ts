import { scoreCVWithBreakdown } from "./cvScoring";
import { discoverRoles, matchVacancy, Language } from "./careerMatchService";
import { finalizeRoleDiscovery, finalizeVacancyMatch, recoverVacancyMatch } from "./careerMatchResultService";
import { RoleDiscovery, VacancyMatch } from "./careerMatchSchemas";
import { InvalidAiResponseError } from "../lib/aiResponseValidation";

export interface CareerMatchAnalysisInput {
  cvText: string;
  targetJobTitle: string;
  experienceLevel: string;
  jobDescription: string;
  language: Language;
}

async function roleDiscovery(input: CareerMatchAnalysisInput): Promise<RoleDiscovery> {
  const [candidateRoles, cvQuality] = await Promise.all([
    discoverRoles(input.cvText, input.targetJobTitle, input.experienceLevel, input.language),
    scoreCVWithBreakdown(input.cvText, "", input.experienceLevel),
  ]);
  return finalizeRoleDiscovery(candidateRoles, cvQuality.total, input.cvText);
}

async function vacancyAnalysis(input: CareerMatchAnalysisInput): Promise<VacancyMatch> {
  const cvQuality = await scoreCVWithBreakdown(input.cvText, "", input.experienceLevel);
  let providerResponse: unknown;
  try {
    const vacancyMatch = await matchVacancy(input.cvText, input.jobDescription, input.targetJobTitle, { experienceLevel: input.experienceLevel, language: input.language });
    providerResponse = vacancyMatch;
    return finalizeVacancyMatch(vacancyMatch, cvQuality.total, input.cvText, input.jobDescription);
  } catch (error) {
    if (!(error instanceof InvalidAiResponseError) || (error.reason !== "invalid_shape" && error.reason !== "source_evidence_mismatch")) throw error;
    return recoverVacancyMatch(error.responsePayload ?? providerResponse, cvQuality.total, input.cvText, input.jobDescription, input.targetJobTitle);
  }
}
export function analyzeCareerMatch(input: CareerMatchAnalysisInput): Promise<RoleDiscovery | VacancyMatch> {
  return input.jobDescription ? vacancyAnalysis(input) : roleDiscovery(input);
}