import { Job, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { Preference, roleVariants } from "./jobMatchScoring";

const CANDIDATES_PER_ROLE = 200;
const MAX_TERMS_PER_ROLE = 8;

const candidateTerms = (roleName: string): string[] =>
  [...new Set(roleVariants(roleName).map((variant) => variant.toLowerCase()))]
    .filter((variant) => variant.length > 2)
    .slice(0, MAX_TERMS_PER_ROLE);

const candidateFilters = (
  preference: { remote: boolean; location: string | null },
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
  if (preference.remote) filters.push({ remote: true });
  if (preference.location) filters.push({ location: { contains: preference.location, mode: "insensitive" } });
  return filters;
};

const loadJobsForRole = (
  preference: { remote: boolean; location: string | null },
  roleName: string,
): Promise<Job[]> => {
  const cutoff = new Date(Date.now() - 90 * 86_400_000);
  return prisma.job.findMany({
    where: { AND: candidateFilters(preference, candidateTerms(roleName), cutoff) },
    orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
    take: CANDIDATES_PER_ROLE,
  });
};

const uniqueCandidates = (candidatesByRole: Job[][]): Job[] => {
  const candidates = new Map<string, Job>();
  for (const roleCandidates of candidatesByRole) {
    for (const job of roleCandidates) candidates.set(`${job.source}:${job.externalId}`, job);
  }
  return [...candidates.values()];
};

export const loadMatchCandidates = async (userId: string): Promise<{
  preference: Preference;
  roleNames: string[];
  candidates: Job[];
} | null> => {
  const preference = await prisma.jobPreference.findUnique({ where: { userId } });
  if (!preference || !preference.active) return null;

  const selectedRoles = preference.roleIds.length
    ? await prisma.jobRole.findMany({
        where: { id: { in: preference.roleIds }, active: true, category: { active: true } },
        select: { name: true },
      })
    : [];
  const roleNames = selectedRoles.length ? selectedRoles.map((role) => role.name) : [preference.role];
  const candidatesByRole = await Promise.all(roleNames.map((roleName) => loadJobsForRole(preference, roleName)));
  return { preference, roleNames, candidates: uniqueCandidates(candidatesByRole) };
};
