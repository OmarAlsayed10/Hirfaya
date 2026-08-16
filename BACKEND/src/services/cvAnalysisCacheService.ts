import { clearAiResponseCache } from "./aiService";
import { clearScoreCache } from "./cvScoring";
import { clearSavedCvAnalysisArtifacts } from "./savedCvAnalysisService";

export function clearCVAnalysisCaches(): void {
  clearAiResponseCache();
  clearScoreCache();
  clearSavedCvAnalysisArtifacts();
}
