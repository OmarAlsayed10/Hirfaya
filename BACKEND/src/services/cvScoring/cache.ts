import { createHash } from "crypto";
import { LEVELS, Level, ScoreBreakdown } from "./constants";

// ponytail: in-memory cache, per instance, lost on restart. Move to a DB table if
// you need scores durable across restarts or shared across multiple instances.
export const CACHE_MAX = 500;
export const scoreCache = new Map<string, ScoreBreakdown>();
export function clearScoreCache(): void {
  scoreCache.clear();
}


export const hashCV = (text: string, jd: string) =>
  createHash("sha256").update(`${text.trim()} ${jd.trim()}`).digest("hex");

const normLevel = (level: string) =>
  LEVELS.includes(level.trim() as Level) ? level.trim() : "";

// True when this exact CV+role+level was already scored (cache hit) — lets the quota
// layer serve repeat/identical analyses for free.
export function hasScore(text: string, targetRole = "", level = ""): boolean {
  return scoreCache.has(
    hashCV(text, `${targetRole.trim()}|${normLevel(level)}`),
  );
}
