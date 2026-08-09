import { MONTHS, LEVELS, Level, REQUIRED_STRENGTH } from "./constants";
import { experienceSection } from "./textParse";
import { Language } from "../../lib/aiLanguage";

// Objective years of experience from date ranges in the Experience section.
// Merges overlapping ranges so concurrent roles aren't double-counted.
export function estimateYearsExperience(text: string): number {
  const block = experienceSection(text);
  if (!block) return 0;
  const now = new Date().getFullYear() + new Date().getMonth() / 12;
  const re =
    /(?:([a-z]{3,9})\.?\s+)?((?:19|20)\d{2})\s*(?:-|–|—|to)\s*(?:(present|current|now|ongoing)|(?:([a-z]{3,9})\.?\s+)?((?:19|20)\d{2}))/gi;
  const spans: [number, number][] = [];
  for (const m of block.matchAll(re)) {
    const sMon = MONTHS[(m[1] || "").slice(0, 3).toLowerCase()] || 1;
    const start = Number(m[2]) + (sMon - 1) / 12;
    let end: number;
    if (m[3]) end = now;
    else {
      const eMon = MONTHS[(m[4] || "").slice(0, 3).toLowerCase()] || 0;
      end = Number(m[5]) + eMon / 12;
    }
    if (end > start) spans.push([start, Math.min(end, now)]);
  }
  if (!spans.length) return 0;
  spans.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [cs, ce] = spans[0];
  for (const [s, e] of spans.slice(1)) {
    if (s <= ce) ce = Math.max(ce, e);
    else {
      total += ce - cs;
      cs = s;
      ce = e;
    }
  }
  total += ce - cs;
  return total;
}

// Objective career strength anchored to years of experience, on the same 0-100
// scale as REQUIRED_STRENGTH. Interpolated between real-world anchors.
// Calibrated: <1yr→Fresh, 1-2yr→Junior, 3-5yr→Mid, 5-8yr→Senior, 8+yr→Lead.
export function baseStrengthFromYears(years: number): number {
  const pts: [number, number][] = [
    [0, 12],
    [1, 25],
    [2, 40],
    [3, 50],
    [5, 70],
    [8, 88],
    [12, 96],
  ];
  if (years <= pts[0][0]) return pts[0][1];
  if (years >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let i = 1; i < pts.length; i++) {
    if (years <= pts[i][0]) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (years - x0)) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
}

// Level bucket is decided by objective years of experience ALONE.
// Skills/LLM strength only move fit WITHIN the level, never the bucket.
export function levelFromYears(years: number): Level {
  if (years < 1) return "Fresh";
  if (years < 3) return "Junior";
  if (years < 5) return "Mid";
  if (years < 8) return "Senior";
  return "Lead";
}

// Highest level whose bar the objective strength actually clears.
export function bestFitLevel(strength: number): Level {
  let best: Level = "Fresh";
  for (const l of LEVELS) if (strength >= REQUIRED_STRENGTH[l]) best = l;
  return best;
}

// Message that matches the computed fit — no cheerleading a 30% as "excellent".
export function levelMessage(
  level: string,
  fit: number,
  strength: number,
  role: string,
  language: Language = "en",
): string {
  const fits = bestFitLevel(strength);
  if (language === "ar") {
    const whoAr = role || "مرشح";
    if (fit >= 90)
      return `ممتاز بالنسبة لـ ${level} ${whoAr} — إنت واصل للمستوى المطلوب في المرحلة دي.`;
    if (fit >= 75)
      return `مناسب بقوة لمستوى ${level} ${whoAr} — فاضل شوية حاجات للدرجة الكاملة.`;
    if (fit >= 55)
      return `قريب من مستوى ${level} بس لسه مش واصل — خبرتك دلوقتي بتقع في مستوى ${fits}.`;
    return `أقل من مستوى ${level} — السيرة دي بتقع في مستوى ${fits} حاليًا. استهدف ${level} بعد ما تبني الخبرة.`;
  }

  const who = role || "candidate";
  if (fit >= 90)
    return `Excellent for a ${level} ${who} — you're meeting the bar for this stage.`;
  if (fit >= 75)
    return `Strong fit for ${level} ${who} — a few gaps from a top score.`;
  if (fit >= 55)
    return `Near the ${level} bar, but not there yet — your experience currently reads as ${fits}.`;
  return `Below the ${level} bar — this CV fits ${fits} level right now. Aim for ${level} once you've built the experience.`;
}
