
import prisma from "../lib/prisma";
import { normalizeJobDescription } from "../lib/jobDescriptionNormalizer";
import { Preference, RawJob } from "./jobMatchScoring";
import {
  fetchAdzuna,
  fetchCareerjet,
  fetchJSearch,
  fetchJooble,
  fetchRemotive,
  fetchRemoteOK,
  fetchTheMuse,
} from "./jobProviderAdapters";
import { fetchGreenhouseJobs, fetchLeverJobs, fetchXJobs } from "./jobSourceService";
import { fetchProvider, JobProvider, JobProviderDiagnostic, JobProviderOutcome, providerDiagnostics } from "./jobProviderOutcome";

const DESC_CAP = 6000;
const REMOTE_HINT = /\bremote\b/i;

// Egypt/MENA-first seeds for the query-based sources (Jooble, Remotive, and The Muse).
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
const ROLE_BATCH_SIZE = 4;
const INGESTION_INTERVAL_HOURS = 6;
const MAX_CONCURRENT_PROVIDER_REQUESTS = 4;
const JOB_PERSISTENCE_BATCH_SIZE = 100;

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
const jobRows = (jobs: RawJob[]) => {
  const uniqueJobs = new Map<string, RawJob>();
  for (const job of jobs) {
    if (job.url && job.title) uniqueJobs.set(`${job.source}:${job.externalId}`, job);
  }
  return Array.from(uniqueJobs.values()).map((job) => ({
    source: job.source,
    externalId: job.externalId,
    title: job.title,
    company: job.company,
    location: job.location,
    remote: REMOTE_HINT.test(`${job.location ?? ""} ${job.title}`),
    url: job.url,
    postedAt: job.postedAt,
    description: normalizeJobDescription(job.description ?? "").plainText.slice(0, DESC_CAP),
  }));
};

async function persistRaw(jobs: RawJob[]): Promise<number> {
  const rows = jobRows(jobs);
  for (let offset = 0; offset < rows.length; offset += JOB_PERSISTENCE_BATCH_SIZE) {
    const batch = rows.slice(offset, offset + JOB_PERSISTENCE_BATCH_SIZE);
    await prisma.$transaction(batch.map((job) => prisma.job.upsert({
      where: { source_externalId: { source: job.source, externalId: job.externalId } },
      create: job,
      update: job,
    })));
  }
  return rows.length;
}

export interface JobIngestionResult {
  persisted: number;
  providers: JobProviderDiagnostic[];
}

const collectProviderOutcomes = async (providers: JobProvider[]): Promise<JobProviderOutcome[]> => {
  const outcomes: JobProviderOutcome[] = [];
  for (let offset = 0; offset < providers.length; offset += MAX_CONCURRENT_PROVIDER_REQUESTS) {
    outcomes.push(...await Promise.all(providers.slice(offset, offset + MAX_CONCURRENT_PROVIDER_REQUESTS).map(fetchProvider)));
  }
  return outcomes;
};

export async function ingestJobs(): Promise<JobIngestionResult> {
  const roles = await activeRoleNames();
  const roleBatch = currentRoleBatch(roles);
  const globalProviders: JobProvider[] = [
    { id: "remoteok", configured: () => true, fetch: fetchRemoteOK },
    { id: "themuse", configured: () => true, fetch: () => fetchTheMuse(seedPref("", "")) },
    { id: "greenhouse", configured: () => Boolean(process.env.GREENHOUSE_BOARDS), fetch: fetchGreenhouseJobs },
    { id: "lever", configured: () => Boolean(process.env.LEVER_SITES), fetch: fetchLeverJobs },
    { id: "x", configured: () => Boolean(process.env.X_API_BEARER_TOKEN), fetch: fetchXJobs },
  ];
  const seededProviders = roleBatch.flatMap((role): JobProvider[] => {
    const preference = seedPref(role, "Egypt");
    return [
      { id: "adzuna", configured: () => Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY), fetch: () => fetchAdzuna(preference) },
      { id: "jsearch", configured: () => Boolean(process.env.JSEARCH_KEY), fetch: () => fetchJSearch(preference) },
      { id: "jooble", configured: () => Boolean(process.env.JOOBLE_KEY), fetch: () => fetchJooble(preference) },
      { id: "remotive", configured: () => true, fetch: () => fetchRemotive(preference) },
      { id: "careerjet", configured: () => Boolean(process.env.CAREERJET_AFFID), fetch: () => fetchCareerjet(preference) },
    ];
  });
  const outcomes = await collectProviderOutcomes([...globalProviders, ...seededProviders]);
  const persisted = await persistRaw(outcomes.flatMap((outcome) => outcome.jobs));
  await prisma.job.deleteMany({
    where: { postedAt: { lt: new Date(Date.now() - MAX_JOB_AGE_DAYS * 86_400_000) } },
  });
  return { persisted, providers: providerDiagnostics(outcomes) };
}
