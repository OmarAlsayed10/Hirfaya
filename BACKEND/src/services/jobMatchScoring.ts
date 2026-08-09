export interface RawJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  postedAt: Date | null;
  description: string;
}

export interface Preference {
  role: string;
  level: string | null;
  location: string | null;
  remote: boolean;
  keywords: string | null;
  blocklist: string | null;
}

const stopwords = new Set(["the", "and", "for", "with", "you", "your", "our", "are", "will", "job", "role", "developer", "engineer", "artist"]);
const roleAliases: Record<string, string[]> = {
  "frontend developer": ["frontend", "front-end", "front end", "ui engineer", "web engineer", "react", "next.js", "vue", "angular"],
  "full stack developer": ["full stack", "full-stack", "fullstack"],
  "mobile developer": ["mobile", "ios", "android", "react native", "flutter"],
  "backend developer": ["backend", "back-end", "back end", "api developer", "platform engineer"],
};
const levelConflicts: Record<string, string[]> = {
  Fresh: ["senior", "sr", "lead", "principal", "staff", "director", "head", "vp", "manager"],
  Junior: ["senior", "sr", "lead", "principal", "staff", "director", "head", "vp", "manager"],
  Mid: ["lead", "principal", "staff", "director", "head", "vp"],
  Senior: ["junior", "jr", "intern", "trainee", "fresh", "entry"],
  Lead: ["junior", "jr", "intern", "trainee", "fresh", "entry"],
};

const normalizeRoleTerms = (text: string): string => text.toLowerCase().replace(/\bfront[\s-]?end\b/g, "frontend").replace(/\bback[\s-]?end\b/g, "backend").replace(/\bfull[\s-]?stack\b/g, "fullstack").replace(/\breact[\s-]?native\b/g, "reactnative");
export const tokenize = (text: string): string[] => normalizeRoleTerms(text).split(/[^a-z0-9+#.]+/).map((word) => word === "3ds" ? "3d" : word).filter((word) => (word.length > 2 || word === "3d") && !stopwords.has(word));
const scoreTerms = (terms: string[], titleTerms: Set<string>, bodyTerms: Set<string>, bodyWeight: number): number => {
  if (terms.length === 0) return 0;
  const hits = terms.reduce((total, term) => total + (titleTerms.has(term) ? 2 : bodyTerms.has(term) ? bodyWeight : 0), 0);
  return (hits / (terms.length * 2)) * 100;
};

export const roleVariants = (role: string): string[] => [role, ...(roleAliases[role.toLowerCase()] ?? [])];

export function fitScore(preference: Preference, job: RawJob): number {
  const keywordTerms = tokenize(preference.keywords ?? "");
  const titleTerms = new Set(tokenize(job.title));
  const bodyTerms = new Set(tokenize(`${job.title} ${job.description}`));
  const roleScore = Math.max(...roleVariants(preference.role).map((role) => scoreTerms(tokenize(role), titleTerms, bodyTerms, 0.75)));
  const keywordScore = keywordTerms.length ? scoreTerms(keywordTerms, titleTerms, bodyTerms, 1) : 100;
  const score = Math.round(keywordTerms.length ? roleScore * 0.6 + keywordScore * 0.4 : roleScore);
  if (preference.level && levelConflicts[preference.level]?.some((term) => titleTerms.has(term))) return 0;
  return Math.min(100, score);
}
