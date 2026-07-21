import { randomUUID } from "crypto";
import { Job, Prisma } from "@prisma/client";
import axios from "axios";
import prisma from "../lib/prisma";

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

const STOPWORDS = new Set(["the", "and", "for", "with", "you", "your", "our", "are", "will", "job", "role", "developer", "engineer", "artist"]);

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((word) => word === "3ds" ? "3d" : word)
    .filter((word) => (word.length > 2 || word === "3d") && !STOPWORDS.has(word));

// Level keywords that conflict with each selected level.
// If the user picks "Junior", any job title containing "senior", "lead", etc. is penalized.
const LEVEL_CONFLICTS: Record<string, string[]> = {
  Fresh:  ["senior", "sr", "lead", "principal", "staff", "director", "head", "vp", "manager"],
  Junior: ["senior", "sr", "lead", "principal", "staff", "director", "head", "vp", "manager"],
  Mid:    ["lead", "principal", "staff", "director", "head", "vp"],
  Senior: ["junior", "jr", "intern", "trainee", "fresh", "entry"],
  Lead:   ["junior", "jr", "intern", "trainee", "fresh", "entry"],
};

// Deterministic fit — token overlap between what the user wants and the job. Title hits weigh
// double. No LLM, so ranking every job costs nothing.
export function fitScore(pref: Preference, job: RawJob): number {
  const roleTerms = tokenize(pref.role);
  const keywordTerms = tokenize(pref.keywords ?? "");
  if (roleTerms.length === 0 && keywordTerms.length === 0) return 50;
  const inTitle = new Set(tokenize(job.title));
  const inBody = new Set(tokenize(`${job.title} ${job.description}`));
  let roleHit = 0;
  for (const r of roleTerms) {
    if (inTitle.has(r)) roleHit += 2;
    else if (inBody.has(r)) roleHit += 0.4;
  }

  const roleScore = roleTerms.length > 0 ? (roleHit/(roleTerms.length * 2))*100:100;

  let keywordHit=0;

  for(const k of keywordTerms){
    if(inTitle.has(k)) keywordHit+=2;
    else if(inBody.has(k)) keywordHit+=1;
  }

  const keywordScore = keywordTerms.length > 0 ? (keywordHit/(keywordTerms.length * 2))*100:100;

  let score: number;
  if(roleTerms.length>0 && keywordTerms.length>0){
    score = Math.round((roleScore * 0.6 + keywordScore * 0.4));
  } else {
    score = Math.round(roleScore);
  }

  // Exclude jobs whose title contains a seniority level that conflicts with the user's selection.
  if (pref.level && LEVEL_CONFLICTS[pref.level]) {
    const conflicts = LEVEL_CONFLICTS[pref.level];
    if (conflicts.some((term) => inTitle.has(term))) {
      return 0;
    }
  }

  return Math.min(100, score);
}

const daysAgo = (d: Date | null): number =>
  d ? (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24) : 999;

export async function fetchAdzuna(pref: Preference): Promise<RawJob[]> {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;
  if (!id || !key) return [];
  const country = process.env.ADZUNA_COUNTRY || "gb";
  const what = encodeURIComponent(`${pref.role} ${pref.keywords ?? ""}`.trim());
  const where = pref.location ? `&where=${encodeURIComponent(pref.location)}` : "";
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${id}&app_key=${key}&results_per_page=25&max_days_old=14&what=${what}${where}`;
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    return (data.results || []).map((r: any): RawJob => ({
      source: "adzuna",
      externalId: String(r.id),
      title: r.title || "",
      company: r.company?.display_name || "Unknown",
      location: r.location?.display_name || null,
      url: r.redirect_url || "",
      postedAt: r.created ? new Date(r.created) : null,
      description: r.description || "",
    }));
  } catch (err) {
    console.error("[jobRadar] Adzuna fetch failed:", (err as Error).message);
    return [];
  }
}

export async function fetchRemotive(pref: Preference): Promise<RawJob[]> {
  const search = encodeURIComponent(`${pref.role} ${pref.keywords ?? ""}`.trim());
  try {
    const { data } = await axios.get(
      `https://remotive.com/api/remote-jobs?search=${search}`,
      { timeout: 10000 }
    );
    return (data.jobs || []).map((j: any): RawJob => ({
      source: "remotive",
      externalId: String(j.id),
      title: j.title || "",
      company: j.company_name || "Unknown",
      location: j.candidate_required_location || null,
      url: j.url || "",
      postedAt: j.publication_date ? new Date(j.publication_date) : null,
      description: j.description || "",
    }));
  } catch (err) {
    console.error("[jobRadar] Remotive fetch failed:", (err as Error).message);
    return [];
  }
}

export async function fetchRemoteOK(): Promise<RawJob[]> {
  try {
    const { data } = await axios.get("https://remoteok.com/api", {
      timeout: 10000,
      headers: { "User-Agent": "Careerak-CV Job Radar" },
    });
    const items = Array.isArray(data) ? data.filter((j: any) => j.position) : [];
    return items.map((j: any): RawJob => ({
      source: "remoteok",
      externalId: String(j.id),
      title: j.position || "",
      company: j.company || "Unknown",
      location: j.location || null,
      url: j.url || "",
      postedAt: j.date ? new Date(j.date) : null,
      description: j.description || "",
    }));
  } catch (err) {
    console.error("[jobRadar] RemoteOK fetch failed:", (err as Error).message);
    return [];
  }
}

export async function fetchJooble(pref: Preference): Promise<RawJob[]> {
  const key = process.env.JOOBLE_KEY;
  if (!key) return [];
  const keywords = `${pref.role} ${pref.keywords ?? ""}`.trim();
  const location = pref.location || process.env.JOOBLE_LOCATION || "Egypt";
  try {
    const { data } = await axios.post(
      `https://jooble.org/api/${key}`,
      { keywords, location },
      { timeout: 10000 }
    );
    return (data.jobs || []).map((j: any): RawJob => ({
      source: "jooble",
      externalId: String(j.id ?? j.link),
      title: j.title || "",
      company: j.company || "Unknown",
      location: j.location || null,
      url: j.link || "",
      postedAt: j.updated ? new Date(j.updated) : null,
      description: j.snippet || "",
    }));
  } catch (err) {
    console.error("[jobRadar] Jooble fetch failed:", (err as Error).message);
    return [];
  }
}

export async function fetchTheMuse(pref: Preference): Promise<RawJob[]> {
  const wanted = tokenize(`${pref.role} ${pref.keywords ?? ""}`);
  try {
    const { data } = await axios.get(
      "https://www.themuse.com/api/public/jobs?page=1",
      { timeout: 10000 }
    );
    return (data.results || [])
      .filter((j: any) => {
        if (wanted.length === 0) return true;
        const inTitle = new Set(tokenize(j.name || ""));
        return wanted.some((w) => inTitle.has(w));
      })
      .map((j: any): RawJob => ({
        source: "themuse",
        externalId: String(j.id),
        title: j.name || "",
        company: j.company?.name || "Unknown",
        location: j.locations?.[0]?.name || null,
        url: j.refs?.landing_page || "",
        postedAt: j.publication_date ? new Date(j.publication_date) : null,
        description: j.contents || "",
      }));
  } catch (err) {
    console.error("[jobRadar] The Muse fetch failed:", (err as Error).message);
    return [];
  }
}

// JSearch (RapidAPI) fans out Google-for-Jobs: LinkedIn/Indeed/Glassdoor postings in one call.
// ponytail: num_pages:1 = one quota unit per call. Bump to widen depth if the paid tier is on.
export async function fetchJSearch(pref: Preference): Promise<RawJob[]> {
  const key = process.env.JSEARCH_KEY;
  if (!key) return [];
  const query = `${pref.role} ${pref.keywords ?? ""} in ${pref.location || "Egypt"}`.trim();
  try {
    const { data } = await axios.get("https://jsearch.p.rapidapi.com/search", {
      params: { query, page: 1, num_pages: 1, date_posted: "month" },
      headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "jsearch.p.rapidapi.com" },
      timeout: 15000,
    });
    return (data.data || []).map((j: any): RawJob => ({
      source: "jsearch",
      externalId: String(j.job_id),
      title: j.job_title || "",
      company: j.employer_name || "Unknown",
      location: [j.job_city, j.job_country].filter(Boolean).join(", ") || null,
      url: j.job_apply_link || j.job_google_link || "",
      postedAt: j.job_posted_at_datetime_utc ? new Date(j.job_posted_at_datetime_utc) : null,
      description: j.job_description || "",
    }));
  } catch (err) {
    console.error("[jobRadar] JSearch fetch failed:", (err as Error).message);
    return [];
  }
}

export async function fetchCareerjet(pref: Preference): Promise<RawJob[]> {
  const affid = process.env.CAREERJET_AFFID;
  if (!affid) return [];
  try {
    const { data } = await axios.get("http://public.api.careerjet.net/search", {
      params: {
        affid,
        keywords: `${pref.role} ${pref.keywords ?? ""}`.trim(),
        location: pref.location || "Egypt",
        locale_code: "en_EG",
        pagesize: 25,
        contenttype: "application/json",
        sort: "date",
      },
      timeout: 10000,
    });
    return (data.jobs || []).map((j: any): RawJob => ({
      source: "careerjet",
      externalId: String(j.url),
      title: j.title || "",
      company: j.company || "Unknown",
      location: j.locations || null,
      url: j.url || "",
      postedAt: j.date ? new Date(j.date) : null,
      description: j.description || "",
    }));
  } catch (err) {
    console.error("[jobRadar] Careerjet fetch failed:", (err as Error).message);
    return [];
  }
}

const MIN_FIT = 30;
const EARLY_BIRD_DAYS = 3;
const CANDIDATES_PER_ROLE = 200;
const MAX_TERMS_PER_ROLE = 8;
const MATCH_WRITE_BATCH_SIZE = 100;
const MAX_CONCURRENT_REFRESHES = 4;

interface RankedJob {
  job: Job;
  fitScore: number;
  earlyBird: boolean;
}

let activeRefreshCount = 0;
const refreshWaiters: Array<() => void> = [];
const refreshesByUser = new Map<string, Promise<number>>();

const acquireRefreshSlot = async (): Promise<void> => {
  if (activeRefreshCount < MAX_CONCURRENT_REFRESHES) {
    activeRefreshCount++;
    return;
  }
  await new Promise<void>((resolve) => refreshWaiters.push(resolve));
};

const releaseRefreshSlot = (): void => {
  const nextRefresh = refreshWaiters.shift();
  if (nextRefresh) nextRefresh();
  else activeRefreshCount--;
};

const runWithRefreshSlot = async (refresh: () => Promise<number>): Promise<number> => {
  await acquireRefreshSlot();
  try {
    return await refresh();
  } finally {
    releaseRefreshSlot();
  }
};

const candidateTerms = (roleName: string): string[] =>
  [...new Set(tokenize(roleName))].slice(0, MAX_TERMS_PER_ROLE);

const candidateFilters = (
  pref: { remote: boolean; location: string | null },
  terms: string[],
  cutoff: Date,
): Prisma.JobWhereInput[] => {
  const filters: Prisma.JobWhereInput[] = [
    { OR: [{ postedAt: null }, { postedAt: { gte: cutoff } }] },
  ];
  if (terms.length) {
    filters.push({
      OR: terms.flatMap((term) => [
        { title: { contains: term, mode: "insensitive" as const } },
        { description: { contains: term, mode: "insensitive" as const } },
      ]),
    });
  }
  if (pref.remote) filters.push({ remote: true });
  if (pref.location) filters.push({ location: { contains: pref.location, mode: "insensitive" } });
  return filters;
};

const loadJobsForRole = (
  pref: { remote: boolean; location: string | null },
  roleName: string,
): Promise<Job[]> => {
  const cutoff = new Date(Date.now() - 90 * 86_400_000);
  return prisma.job.findMany({
    where: { AND: candidateFilters(pref, candidateTerms(roleName), cutoff) },
    orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
    take: CANDIDATES_PER_ROLE,
  });
};

const loadCandidateJobs = async (
  pref: { remote: boolean; location: string | null },
  roleNames: string[],
): Promise<Job[]> => {
  const candidatesByRole = await Promise.all(
    roleNames.map((roleName) => loadJobsForRole(pref, roleName)),
  );
  const uniqueCandidates = new Map<string, Job>();
  for (const candidates of candidatesByRole) {
    for (const job of candidates) uniqueCandidates.set(`${job.source}:${job.externalId}`, job);
  }
  return [...uniqueCandidates.values()];
};
const rankedJobs = (
  pref: Preference,
  roleNames: string[],
  candidates: Job[],
): RankedJob[] => {
  const blockedCompanies = new Set(
    (pref.blocklist ?? "").split(",").map((company) => company.trim().toLowerCase()).filter(Boolean),
  );
  const ranked: RankedJob[] = [];
  for (const job of candidates) {
    if (!job.url || blockedCompanies.has(job.company.toLowerCase())) continue;
    const fit = Math.max(...roleNames.map((role) => fitScore({ ...pref, role }, job)));
    if (fit < MIN_FIT) continue;
    ranked.push({ job, fitScore: fit, earlyBird: daysAgo(job.postedAt) <= EARLY_BIRD_DAYS });
  }
  return ranked;
};

const matchValue = (userId: string, ranked: RankedJob, refreshedAt: Date): Prisma.Sql =>
  Prisma.sql`(
    ${randomUUID()}, ${userId}, ${ranked.job.source}, ${ranked.job.externalId},
    ${ranked.job.title}, ${ranked.job.company}, ${ranked.job.location}, ${ranked.job.url},
    ${ranked.job.postedAt}, ${ranked.fitScore}, ${ranked.earlyBird}, ${refreshedAt}, ${refreshedAt}
  )`;

const upsertMatchBatch = async (
  tx: Prisma.TransactionClient,
  userId: string,
  rankedBatch: RankedJob[],
  refreshedAt: Date,
): Promise<void> => {
  const values = rankedBatch.map((ranked) => matchValue(userId, ranked, refreshedAt));
  await tx.$executeRaw(Prisma.sql`
    INSERT INTO "JobMatch" (
      "id", "userId", "source", "externalId", "title", "company", "location", "url",
      "postedAt", "fitScore", "earlyBird", "createdAt", "updatedAt"
    ) VALUES ${Prisma.join(values)}
    ON CONFLICT ("userId", "source", "externalId") DO UPDATE SET
      "title" = EXCLUDED."title",
      "company" = EXCLUDED."company",
      "location" = EXCLUDED."location",
      "url" = EXCLUDED."url",
      "postedAt" = EXCLUDED."postedAt",
      "fitScore" = EXCLUDED."fitScore",
      "earlyBird" = EXCLUDED."earlyBird",
      "updatedAt" = EXCLUDED."updatedAt"
  `);
};

const persistRankedJobs = async (userId: string, ranked: RankedJob[]): Promise<void> => {
  const refreshedAt = new Date();
  await prisma.$transaction(async (tx) => {
    for (let offset = 0; offset < ranked.length; offset += MATCH_WRITE_BATCH_SIZE) {
      await upsertMatchBatch(tx, userId, ranked.slice(offset, offset + MATCH_WRITE_BATCH_SIZE), refreshedAt);
    }
    await tx.jobMatch.deleteMany({
      where: { userId, status: "matched", updatedAt: { lt: refreshedAt } },
    });
  });
};

const calculateMatchesForUser = async (userId: string): Promise<number> => {
  const pref = await prisma.jobPreference.findUnique({ where: { userId } });
  if (!pref || !pref.active) return 0;
  const selectedRoles = pref.roleIds.length
    ? await prisma.jobRole.findMany({
        where: { id: { in: pref.roleIds }, active: true, category: { active: true } },
        select: { name: true },
      })
    : [];
  const roleNames = selectedRoles.length ? selectedRoles.map((role) => role.name) : [pref.role];
  const candidates = await loadCandidateJobs(pref, roleNames);
  const ranked = rankedJobs(pref, roleNames, candidates);
  await persistRankedJobs(userId, ranked);
  return ranked.length;
};

export const refreshMatchesForUser = (userId: string): Promise<number> => {
  const runningRefresh = refreshesByUser.get(userId);
  if (runningRefresh) return runningRefresh;

  const refresh = runWithRefreshSlot(() => calculateMatchesForUser(userId))
    .finally(() => {
      if (refreshesByUser.get(userId) === refresh) refreshesByUser.delete(userId);
    });
  refreshesByUser.set(userId, refresh);
  return refresh;
};
const PAGE_SIZE = 20;

const countryOf = (location: string | null): string | null => {
  if (!location) return null;
  const tail = location.split(",").pop()?.trim();
  return tail && tail.length > 1 ? tail : null;
};

export async function listMatches(userId: string, page = 1, country?: string) {
  const base = { userId, status: { not: "dismissed" } };
  const where = country
    ? { ...base, location: { contains: country, mode: "insensitive" as const } }
    : base;
  const safePage = Math.max(1, Math.floor(page) || 1);

  const [matches, total, locGroups] = await Promise.all([
    prisma.jobMatch.findMany({
      where,
      orderBy: [{ earlyBird: "desc" }, { fitScore: "desc" }, { postedAt: "desc" }],
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.jobMatch.count({ where }),
    prisma.jobMatch.groupBy({ by: ["location"], where: base }),
  ]);

  const countries = [...new Set(locGroups.map((g) => countryOf(g.location)).filter((c): c is string => !!c))].sort();
  return { matches, total, page: safePage, pageSize: PAGE_SIZE, countries };
}
