
import prisma from "../lib/prisma";
import {
  RawJob,
  Preference,
  fetchAdzuna,
  fetchRemotive,
  fetchRemoteOK,
  fetchTheMuse,
  fetchJooble,
  fetchJSearch,
  fetchCareerjet,
} from "./jobRadarService";

const DESC_CAP = 6000;
const REMOTE_HINT = /\bremote\b/i;

// Egypt/MENA-first seeds for the query-based sources (Jooble/Adzuna/Remotive/TheMuse).
// Global sources (Greenhouse/Lever/RemoteOK) ignore the query and return their whole board.
const FALLBACK_ROLES = [
  "software engineer", "frontend developer", "backend developer", "full stack developer",
  "mobile developer", "devops engineer", "qa engineer", "data analyst", "data scientist",
  "machine learning engineer", "product manager", "project manager", "business analyst",
  "business development", "operations manager", "marketing specialist", "digital marketing",
  "market research", "content creator", "sales representative", "account manager",
  "accountant", "financial analyst", "auditor", "human resources", "recruiter",
  "customer support", "customer success", "graphic designer", "ui ux designer",
  "content writer", "translator", "teacher", "pharmacist", "civil engineer",
  "mechanical engineer", "electrical engineer", "architect", "supply chain",
  "logistics coordinator", "administrative assistant", "video editor",
];



const seedPref = (role: string, location: string): Preference => ({
  role,
  level: null,
  location: location || null,
  remote: false,
  keywords: null,
  blocklist: null,
});

const MAX_JOB_AGE_DAYS = 90;
const JSEARCH_COOLDOWN_H = 20;
const ROLE_BATCH_SIZE = 4;
const INGESTION_INTERVAL_HOURS = 6;

const activeRoleNames = async (): Promise<string[]> => {
  const roles = await prisma.jobRole.findMany({
    where: { active: true, category: { active: true } },
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return roles.length ? roles.map((role) => role.name) : FALLBACK_ROLES;
};

const currentRoleBatch = (roles: string[]): string[] => {
  const cycle = Math.floor(Date.now() / (INGESTION_INTERVAL_HOURS * 3_600_000));
  const start = (cycle * ROLE_BATCH_SIZE) % roles.length;
  return Array.from({ length: Math.min(ROLE_BATCH_SIZE, roles.length) }, (_, offset) =>
    roles[(start + offset) % roles.length],
  );
};

const dayOfYear = (): number =>
  Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86_400_000);

// JSearch is the only budgeted source (RapidAPI free tier). Gate it to one call per ~day and
// rotate through one role at a time, so the cron's several daily runs can't drain the quota.
async function jsearchDue(): Promise<boolean> {
  const last = await prisma.job.findFirst({
    where: { source: "jsearch" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return !last || Date.now() - last.createdAt.getTime() > JSEARCH_COOLDOWN_H * 3_600_000;
}

// De-dupe on source+externalId and insert-only (skip existing on the unique). One round-trip.
async function persistRaw(jobs: RawJob[]): Promise<number> {
  const seen = new Map<string, RawJob>();
  for (const job of jobs) {
    if (!job.url || !job.title) continue;
    seen.set(`${job.source}:${job.externalId}`, job);
  }
  const rows = Array.from(seen.values()).map((job) => ({
    source: job.source,
    externalId: job.externalId,
    title: job.title,
    company: job.company,
    location: job.location,
    remote: REMOTE_HINT.test(`${job.location ?? ""} ${job.title}`),
    url: job.url,
    postedAt: job.postedAt,
    description: (job.description ?? "").slice(0, DESC_CAP),
  }));
  const { count } = await prisma.job.createMany({ data: rows, skipDuplicates: true });
  return count;
}

// Pull from every source into the shared Job pool, prune stale. Company boards (Greenhouse/Lever)
// aren't polled here — they're fetched live per company search, so the pool grows from real demand.
export async function ingestJobs(): Promise<number> {
  const roles = await activeRoleNames();
  const roleBatch = currentRoleBatch(roles);
  const global = (
    await Promise.all([fetchRemoteOK(), fetchTheMuse(seedPref("", ""))])
  ).flat();

  const seeded = (
    await Promise.all(
      roleBatch.map((role) => {
        const pref = seedPref(role, "Egypt");
        return Promise.all([
          fetchJooble(pref),
          fetchRemotive(pref),
          fetchAdzuna(pref),
          fetchCareerjet(pref),
        ]).then((r) => r.flat());
      })
    )
  ).flat();

  let jsearch: RawJob[] = [];
  if (await jsearchDue()) {
    const dailyRole = roles[dayOfYear() % roles.length];
    jsearch = await fetchJSearch(seedPref(dailyRole, "Egypt"));
  }

  const count = await persistRaw([...global, ...seeded, ...jsearch]);

  // Drop postings older than 90 days. Null postedAt stays (age unknown) — prune those by createdAt if needed.
  await prisma.job.deleteMany({
    where: { postedAt: { lt: new Date(Date.now() - MAX_JOB_AGE_DAYS * 86_400_000) } },
  });

  return count;
}

