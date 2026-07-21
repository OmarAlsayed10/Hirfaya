import {
  ScoreBreakdown,
  ScoreCategory,
  ScoreDimension,
  LEVELS,
  Level,
  CATEGORY_OWNER,
  REQUIRED_STRENGTH,
  NEXT_LEVEL,
  LEVEL_YEAR_RANGE,
} from "./constants";
import { hashCV, scoreCache, CACHE_MAX } from "./cache";
import {
  scoreContact,
  scoreEducation,
  scoreATSFormatting,
  atsCompatibilityObjective,
  formattingLayoutObjective,
  experienceObjective,
  contentQualityObjective,
  keywordMatchObjective,
} from "./objectiveScores";
import {
  estimateYearsExperience,
  baseStrengthFromYears,
  levelFromYears,
  levelMessage,
} from "./levelModel";
import { gradeQuality } from "./llmGrader";

export async function scoreCVWithBreakdown(
  text: string,
  targetRole = "",
  level = "",
): Promise<ScoreBreakdown> {
  const role = targetRole.trim();
  const lvl = LEVELS.includes(level.trim() as Level) ? level.trim() : "";
  const key = hashCV(text, `${role}|${lvl}`);
  const cached = scoreCache.get(key);
  if (cached) return cached;

  const contact = scoreContact(text);
  const education = scoreEducation(text);
  const ats = scoreATSFormatting(text);
  const atsCompatibility = atsCompatibilityObjective(text);
  const formattingLayout = formattingLayoutObjective(text);
  const exp = experienceObjective(text);
  const summaryPresent = /\b(summary|profile|objective|about)\b/i.test(text)
    ? 5
    : 0;
  const skillsPresent =
    /\b(skills|technologies|competencies|tools|expertise)\b/i.test(text)
      ? 4
      : 0;
  const skillItems = (() => {
    const idx = text
      .split("\n")
      .findIndex((l) =>
        /\b(skills|technologies|competencies|tools)\b/i.test(l),
      );
    if (idx === -1) return 0;
    const block = text
      .split("\n")
      .slice(idx + 1, idx + 12)
      .join(", ");
    return block
      .split(/[,|•\n]/)
      .filter((s) => s.trim().length > 1 && s.trim().length < 40).length;
  })();
  const skillsCount = skillItems >= 8 ? 4 : skillItems >= 4 ? 2 : 0;

  // Narrow LLM call: quality sub-scores judged against the candidate's declared level.
  const q = await gradeQuality(text, role, lvl);

  const categories: ScoreCategory[] = [
    contact,
    {
      name: "Summary",
      earned: Math.min(15, summaryPresent + q.summaryQuality),
      max: 15,
      tip: summaryPresent === 0 ? "Add a Professional Summary" : q.summaryTip,
      blocker:
        summaryPresent + q.summaryQuality >= 15
          ? null
          : summaryPresent === 0
            ? "content"
            : q.summaryBlocker,
    },
    {
      name: "Work Experience",
      earned: Math.min(
        30,
        exp.base + exp.metric + exp.verb + q.experienceQuality,
      ),
      max: 30,
      tip: [...exp.tips, q.experienceTip].filter(Boolean).join(" · ") || null,
      blocker:
        exp.base + exp.metric + exp.verb + q.experienceQuality >= 30
          ? null
          : exp.tips.length
            ? "content"
            : q.experienceBlocker,
    },
    education,
    {
      name: "Skills",
      earned: Math.min(15, skillsPresent + skillsCount + q.skillsRelevance),
      max: 15,
      tip: skillsPresent === 0 ? "Add a Skills section" : q.skillsTip,
      blocker:
        skillsPresent + skillsCount + q.skillsRelevance >= 15
          ? null
          : "content",
    },
    ats,
    {
      name: "Keywords",
      earned: q.keywordsQuality ?? 5,
      max: 10,
      tip: q.keywordsTip,
      blocker: (q.keywordsQuality ?? 5) >= 10 ? null : "content",
    },
  ];

  categories.forEach((c) => {
    c.owner = CATEGORY_OWNER[c.name] ?? "user";
  });

  const pct = (v: number, max: number) =>
    Math.max(0, Math.min(100, Math.round((v / max) * 100)));

  const IMPROVE_HINT: Record<string, string> = {
    "Content Quality":
      'Add a concrete achievement with a number to each role, e.g. "Shipped 3 features that cut support tickets 20%."',
    "ATS Compatibility":
      "Use standard section headings (Summary, Experience, Skills, Education) and a single-column layout so ATS parsers read every line.",
    "Keyword Match":
      "Mirror the exact tools and skills from your target job post — match their wording, not synonyms.",
    "Grammar & Spelling":
      "Proofread for punctuation, consistent tense, and spacing; read each bullet aloud to catch awkward phrasing.",
    "Formatting & Layout":
      "Keep one consistent bullet style, spacing, and date format, and order sections Summary → Experience → Skills → Education.",
    "Impact & Results":
      'Rewrite every bullet as: strong action verb + what you did + measurable result. Example: "Reduced API latency 35% by adding Redis caching and pagination."',
  };

  const fill = (name: string, score: number, base: string[]): string[] => {
    const out = [...base];
    if (
      name === "Impact & Results" &&
      score < 100 &&
      !out.some((t) => /example|e\.g\./i.test(t))
    ) {
      out.push(IMPROVE_HINT[name]);
    }
    if (out.length > 0) return out;
    if (score >= 100)
      return ["Strong here — nothing blocking a top score."];
    if (score >= 85)
      return [
        "Strong — nothing to fix here; a perfect score is reserved for exceptional writing.",
      ];
    return [IMPROVE_HINT[name]];
  };

  const mk = (
    name: string,
    score: number,
    base: (string | null | undefined)[],
  ): ScoreDimension => ({
    name,
    score,
    details: fill(
      name,
      score,
      base.filter((t): t is string => !!t),
    ),
  });

  const contentQuality = contentQualityObjective(text, exp);
  const keywordMatch = keywordMatchObjective(text);

  const dimensions: ScoreDimension[] = [
    mk("Content Quality", contentQuality.score, contentQuality.details),
    mk("ATS Compatibility", atsCompatibility.score, atsCompatibility.details),
    mk("Keyword Match", keywordMatch.score, keywordMatch.details),
    mk("Grammar & Spelling", pct(q.grammarQuality, 10), [q.grammarTip]),
    mk("Formatting & Layout", formattingLayout.score, formattingLayout.details),
    mk(
      "Impact & Results",
      pct(exp.metric + exp.verb, 15),
      exp.tips.filter((t) =>
        /quantif|number|percentage|action verb|metric|impact/i.test(t),
      ),
    ),
  ];

  // Headline reflects the breakdown the user actually sees: a weighted mean of the six
  // dimensions, so a low dimension (e.g. weak Impact) genuinely drags the total down.
  const DIM_WEIGHTS: Record<string, number> = {
    "Content Quality": 0.25,
    "Impact & Results": 0.2,
    "Keyword Match": 0.15,
    "ATS Compatibility": 0.15,
    "Formatting & Layout": 0.15,
    "Grammar & Spelling": 0.1,
  };
  const total = Math.round(
    dimensions.reduce((s, d) => s + d.score * (DIM_WEIGHTS[d.name] ?? 0), 0),
  );

  // Career strength is anchored to objective years of experience (primary signal),
  // nudged by the LLM's holistic read — so fit tracks real experience, not "nice CV".
  const yoe = estimateYearsExperience(text);

  // Apply a direct skills modifier bonus/penalty to strength
  let skillBonus = 0;
  if (q.skillLevel === "expert") skillBonus = 12;
  else if (q.skillLevel === "advanced") skillBonus = 8;
  else if (q.skillLevel === "solid") skillBonus = 4;
  else if (q.skillLevel === "foundational") skillBonus = -6;

  const strength = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        baseStrengthFromYears(yoe) * 0.7 +
          q.candidateStrength * 0.3 +
          skillBonus,
      ),
    ),
  );

  // No level chosen → infer it from objective years of experience ALONE.
  const detected = !lvl;
  const effectiveLevel = lvl || levelFromYears(yoe);

  // Level fit ("how well you meet THIS level's bar") is kept as a separate readout, not the headline.
  const req = REQUIRED_STRENGTH[effectiveLevel] ?? 50;
  const ratio = strength / req;
  const levelFit = Math.round(
    ratio >= 1
      ? Math.min(100, 92 + (strength - req) * 0.4)
      : Math.max(5, 100 * Math.pow(ratio, 1.5)),
  );

  const result: ScoreBreakdown = { total, categories, dimensions };
  const belowBar = strength < req;
  // Below the target bar: aim tips at reaching THIS level. At/above it: aim at the next level up.
  const goalLevel = belowBar
    ? effectiveLevel
    : NEXT_LEVEL[effectiveLevel] || effectiveLevel;

  // Build human-readable reasons WHY this level was determined.
  const levelReasons: string[] = [];
  const roundedYoe = Math.round(yoe * 10) / 10;
  if (roundedYoe > 0) {
    levelReasons.push(
      `~${roundedYoe} year${roundedYoe !== 1 ? "s" : ""} of professional experience detected`,
    );
  } else {
    levelReasons.push(
      "No professional work experience detected — evaluated on projects, education, and skills",
    );
  }
  const expectedRange = LEVEL_YEAR_RANGE[effectiveLevel];
  if (expectedRange) {
    levelReasons.push(
      `${effectiveLevel} level typically requires ${expectedRange} of experience`,
    );
  }
  // Skill-level reason from LLM
  const skillLevel = q.skillLevel || null;
  if (skillLevel) {
    levelReasons.push(`Skills assessment: ${skillLevel}`);
  }
  // Add any LLM-provided reasons
  if (Array.isArray(q.levelReasons)) {
    for (const r of q.levelReasons.slice(0, 3)) {
      if (
        r &&
        !levelReasons.some((lr) =>
          lr.toLowerCase().includes(r.toLowerCase().slice(0, 30)),
        )
      ) {
        levelReasons.push(String(r));
      }
    }
  }

  result.levelContext = {
    role: role || "professional",
    level: effectiveLevel,
    fit: levelFit,
    detected,
    message: detected
      ? `Based on your experience and skills, this CV reads as ${effectiveLevel} level${role ? ` ${role}` : ""}.`
      : levelMessage(effectiveLevel, levelFit, strength, role),
    nextLevel: goalLevel,
    nextLevelTips: q.nextLevelTips || [],
    belowBar,
    yearsOfExperience: roundedYoe,
    levelReasons,
    skillLevel: skillLevel || undefined,
  };

  if (scoreCache.size >= CACHE_MAX)
    scoreCache.delete(scoreCache.keys().next().value!);
  scoreCache.set(key, result);
  return result;
}
