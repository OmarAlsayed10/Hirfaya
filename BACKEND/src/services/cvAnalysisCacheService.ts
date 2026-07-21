import { clearAiResponseCache } from "./aiService";
import { clearScoreCache } from "./cvScoring";

export function clearCVAnalysisCaches(): void {
  // Cache keys are content hashes and do not carry user ownership, so clearing
  // both bounded caches is the only way to guarantee a deleted user's derived
  // CV data is no longer retained in this process.
  clearAiResponseCache();
  clearScoreCache();
}
