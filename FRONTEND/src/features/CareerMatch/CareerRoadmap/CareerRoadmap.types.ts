import type { VacancyMatch, VacancyRequirement } from "../CareerMatch.types";

export type RoadmapSource = Pick<VacancyMatch, "partialRequirements" | "missingRequirements">;

export interface SkillRoadmapDetails {
  skill: string;
  skillKey: string;
  category: string;
  officialDocs: { title: string; url: string } | null;
  playground: { title: string; url: string } | null;
  projectIdeas: string[];
  courseLinks: Array<{ title: string; url: string }>;
}

export interface RoadmapStep {
  requirement: string;
  explanation: string;
  priority: "must_have" | "preferred";
  category: VacancyRequirement["category"];
  evidenceStatus: "partial" | "missing";
}
