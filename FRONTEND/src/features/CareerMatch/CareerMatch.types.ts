export interface LiveMarketStatus {
  tier: string;
  limit: number;
  used: number;
  remaining: number;
  period: string;
}

export interface RoleFit {
  title: string;
  fitScore: number;
  fitType: "primary" | "adjacent" | "stretch";
  evidenceLevel: "professional" | "project" | "training" | "skills_only";
  fitBreakdown: {
    professionalExperience: number;
    relevantProjects: number;
    demonstratedSkills: number;
    educationAndTraining: number;
  };
  summary: string;
  cvEvidence: string[];
  strengths: string[];
  gaps: string[];
}

export interface DiscoveryRecommendation {
  action: string;
  evidence: { cvExcerpt: string; rationale: string };
}

export interface RoleDiscovery {
  mode: "role_discovery";
  inferredProfile: string;
  cvQualityScore: number;
  roles: RoleFit[];
  recommendations: DiscoveryRecommendation[];
}

export interface VacancyRequirement {
  requirement: string;
  cvEvidence: string;
  explanation: string;
  priority: "must_have" | "preferred";
  category: "skill" | "experience" | "education" | "certification" | "eligibility" | "responsibility";
  evidenceLevel: "professional" | "project" | "training" | "skills_only";
}

export interface VacancyMatch {
  mode: "vacancy_match";
  inferredJobTitle: string;
  cvQualityScore: number;
  jobMatchScore: number;
  screeningRisk: "low" | "medium" | "high";
  scoreLabel: "strong_evidence_match" | "partial_evidence_match" | "low_evidence_match";
  matchBreakdown: {
    requirementsMatch: number;
    relevantExperience: number;
    demonstratedSkills: number;
    evidenceQuality: number;
  };
  summary: string;
  matchedRequirements: VacancyRequirement[];
  partialRequirements: VacancyRequirement[];
  missingRequirements: Array<{
    requirement: string;
    explanation: string;
    priority: "must_have" | "preferred";
    category: VacancyRequirement["category"];
  }>;
  reviewNeededRequirements: Array<{
    requirement: string;
    note: string;
  }>;
  recommendations: Array<{
    action: string;
    evidence: { cvExcerpt: string; jobRequirement: string; rationale: string };
  }>;
  alternativeRoles: string[];
}

export interface MarketSnapshot {
  searchedAt: string;
  signals: Array<{
    roleTitle: string;
    demand: "strong" | "moderate" | "niche";
    summary: string;
    sources: Array<{ title: string; url: string; publishedAt: string | null }>;
  }>;
}

export interface CareerMatchResponse {
  analysis: RoleDiscovery | VacancyMatch;
  marketSnapshot: MarketSnapshot | null;
  liveMarketStatus: LiveMarketStatus;
  cached: boolean;
}