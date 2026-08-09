export interface ScoreCategory {
  name: string;
  earned: number;
  max: number;
  tip: string | null;
  blocker: "content" | "experience" | null;
  owner?: "user" | "ai";
}

// Who closes a gap: "ai" = the optimizer rewrites it (wording, keywords, structure);
// "user" = only the candidate can supply it (real numbers, achievements, contact facts).
export const CATEGORY_OWNER: Record<string, "user" | "ai"> = {
  "Contact Info": "user",
  Summary: "ai",
  "Work Experience": "user",
  Education: "user",
  Skills: "ai",
  "ATS Formatting": "ai",
  Keywords: "ai",
};

export interface LevelContext {
  role: string;
  level: string;
  fit?: number;
  message: string;
  nextLevel: string;
  nextLevelTips: string[];
  belowBar: boolean;
  detected: boolean;
  yearsOfExperience?: number;
  levelReasons?: string[];
  skillLevel?: string;
}

export interface ScoreDimension {
  name: string;
  score: number;
  details: string[];
}

export interface ScoreBreakdown {
  total: number;
  categories: ScoreCategory[];
  dimensions: ScoreDimension[];
  levelContext?: LevelContext;
}

export const LEVELS = ["Fresh", "Junior", "Mid", "Senior", "Lead"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_EXPECTATIONS: Record<string, string> = {
  Fresh:
    "less than 1 year of professional experience. A brand-new graduate/entrant — judge on education, academic/personal projects, internships, and foundational skills. Do NOT penalize a lack of paid work experience — strong projects count fully at this level.",
  Junior:
    "1-2 years of professional experience. Some real work or internship experience, basic quantified impact, solid fundamentals. Personal projects still count.",
  Mid: "3-5 years of professional experience. Consistent delivery, ownership of features/areas, solid skill set, clear measurable impact across roles.",
  Senior:
    "5-8 years of professional experience. Deep expertise, architecture/strategy decisions, significant quantified business impact, mentoring others.",
  Lead: "8+ years of professional experience. Senior-level expertise PLUS team leadership, cross-functional influence, and org-level impact.",
};

// Required absolute career-strength for each level, on the same 0-100 scale the LLM rates
// candidateStrength. Strictly increasing, so fit is non-increasing across levels (no inversions).
// Calibrated: Fresh <1yr, Junior 1-2yr, Mid 3-5yr, Senior 5-8yr, Lead 8+yr.
export const REQUIRED_STRENGTH: Record<string, number> = {
  Fresh: 8,
  Junior: 25,
  Mid: 48,
  Senior: 70,
  Lead: 88,
};

export const NEXT_LEVEL: Record<string, string> = {
  Fresh: "Junior",
  Junior: "Mid",
  Mid: "Senior",
  Senior: "Lead",
  Lead: "Lead",
};

// Year-range label for each level — used in levelReasons.
export const LEVEL_YEAR_RANGE: Record<string, string> = {
  Fresh: "less than 1 year",
  Junior: "1–2 years",
  Mid: "3–5 years",
  Senior: "5–8 years",
  Lead: "8+ years",
};

export const LEVEL_YEAR_RANGE_AR: Record<string, string> = {
  Fresh: "أقل من سنة",
  Junior: "سنة إلى سنتين",
  Mid: "3–5 سنوات",
  Senior: "5–8 سنوات",
  Lead: "8+ سنوات",
};

export const SKILL_LEVEL_AR: Record<string, string> = {
  foundational: "أساسي",
  developing: "في طور النمو",
  solid: "قوي",
  advanced: "متقدم",
  expert: "خبير",
};

// Non-tech and operational CVs (health, safety, admin, sales, field work) lean on verbs the
// original list missed — "Handled", "Inspected", "Monitored" — and were marked down for it.
export const ACTION_VERB =
  /^(achieved|accelerated|administered|advised|analy[sz]ed|architected|arranged|assessed|assisted|audited|authored|automated|briefed|built|championed|collaborated|communicated|compiled|completed|conducted|consolidated|contributed|controlled|converted|coordinated|counseled|created|cut|decreased|defined|delivered|demonstrated|deployed|designed|developed|devised|diagnosed|directed|documented|doubled|drafted|drove|eliminated|engineered|enhanced|ensured|escalated|established|evaluated|examined|executed|expanded|facilitated|forecast|formulated|generated|grew|guided|handled|headed|identified|implemented|improved|increased|influenced|initiated|inspected|installed|instructed|integrated|interpreted|introduced|investigated|launched|led|maintained|managed|maximized|mentored|minimized|modernized|monitored|negotiated|operated|optimized|organized|overhauled|oversaw|performed|pioneered|planned|prepared|presented|prevented|processed|produced|promoted|provided|published|ran|rebuilt|recommended|recorded|recruited|reduced|refactored|reported|researched|resolved|restructured|reviewed|revamped|saved|scaled|scheduled|secured|simplified|sold|sourced|spearheaded|standardi[sz]ed|streamlined|strengthened|supervised|supported|sustained|tested|tracked|trained|transformed|translated|troubleshot|upgraded|validated|verified|wrote)\b/i;

export const STD_HEADINGS = [
  "experience",
  "education",
  "skills",
  "summary",
  "profile",
  "objective",
  "projects",
  "certifications",
  "technical skills",
  "work history",
  "employment",
];

// Bullet markers, incl. Word/Symbol private-use glyphs (U+F0xx like U+F0B7) that
// PDF extraction emits and String.trim() does NOT strip.
export const BULLET_MARKER = "-•*–▪●‣⁃+>◦○∙·\\uE000-\\uF8FF";
export const BULLET_PREFIX = new RegExp(`^[${BULLET_MARKER}](?:\\s+|$)`);
export const BULLET_STRIP = new RegExp(`^[${BULLET_MARKER}]\\s*`);
// "Label: " lead on many PDF bullets (e.g. "Performance & Caching: Designed …").
export const BULLET_LABEL = /^[A-Z][A-Za-z0-9 &/-]{1,38}:\s+/;

export const SHOULD_DEBUG_CV_SCORING = process.env.NODE_ENV !== "production";

export const PRIMARY_SECTION_ORDER = [
  "summary",
  "experience",
  "skills",
  "education",
] as const;

export type PrimarySection = (typeof PRIMARY_SECTION_ORDER)[number];

export interface ObjectiveDiagnostic {
  score: number;
  details: string[];
  checks: Record<string, unknown>;
}

export const MONTH_YEAR_DATE =
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(?:19|20)\d{2}\b/i;

export const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

// Role-AGNOSTIC keyword collection: pull list items from every keyword-bearing
// section (skills, courses, certifications, tools…), whatever the field. No role
// table — density of concrete terms is the signal, so it works for any role.
export const KEYWORD_SECTION =
  /\b(technical\s+skills|core\s+skills|key\s+skills|skills|technologies|competencies|tools|expertise|courses?|certifications?|licen[sc]es|languages|frameworks|proficiencies)\b/i;

export const pctClamp = (value: number, max: number) =>
  Math.max(0, Math.min(100, Math.round((value / max) * 100)));

export interface QualityScores {
  summaryQuality: number;
  summaryTip: string | null;
  summaryBlocker: "content" | "experience" | null;
  experienceQuality: number;
  experienceTip: string | null;
  experienceBlocker: "content" | "experience" | null;
  skillsRelevance: number;
  skillsTip: string | null;
  keywordsQuality: number;
  keywordsTip: string | null;
  grammarQuality: number;
  grammarTip: string | null;
  candidateStrength: number;
  roleAlignment: number;
  levelMessage: string | null;
  nextLevelTips: string[];
  skillLevel: string | null;
  levelReasons: string[];
}
