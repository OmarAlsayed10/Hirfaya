import { scoreCVWithBreakdown } from "./cvScoring";
import { discoverRoles, matchVacancy } from "./careerMatchService";
import { finalizeRoleDiscovery, finalizeVacancyMatch } from "./careerMatchResultService";
import { RoleDiscovery, VacancyMatch } from "./careerMatchSchemas";

export interface CareerMatchAnalysisInput {
  cvText: string;
  targetJobTitle: string;
  experienceLevel: string;
  jobDescription: string;
}

async function roleDiscovery(input: CareerMatchAnalysisInput): Promise<RoleDiscovery> {
  const [candidateRoles, cvQuality] = await Promise.all([
    discoverRoles(input.cvText, input.targetJobTitle, input.experienceLevel),
    scoreCVWithBreakdown(input.cvText, "", input.experienceLevel),
  ]);
  return finalizeRoleDiscovery(candidateRoles, cvQuality.total, input.cvText);
}

async function vacancyAnalysis(input: CareerMatchAnalysisInput): Promise<VacancyMatch> {
  const [vacancyMatch, cvQuality] = await Promise.all([
    matchVacancy(input.cvText, input.jobDescription, input.targetJobTitle, input.experienceLevel),
    scoreCVWithBreakdown(input.cvText, "", input.experienceLevel),
  ]);
  return finalizeVacancyMatch(vacancyMatch, cvQuality.total, input.cvText, input.jobDescription);
}

export function analyzeCareerMatch(input: CareerMatchAnalysisInput): Promise<RoleDiscovery | VacancyMatch> {
  return input.jobDescription ? vacancyAnalysis(input) : roleDiscovery(input);
}