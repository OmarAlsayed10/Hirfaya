import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { CustomRequest } from "../middleware/validateJWTMiddleware";
import { refreshMatchesForUser, listMatches } from "../services/jobRadarService";
import { generateCoverLetter } from "../services/coverLetterService";
import { getPrimaryCV } from "../services/cvBuilderService";
import { cvToPlainText } from "../services/documentService";
import { generateVariants } from "../services/cvVariantService";
import { selectedJobRoles } from "../services/jobCatalogService";

const VALID_STATUS = ["matched", "applied", "interview", "offer", "rejected", "dismissed"];
const MAX_CV_TEXT = 30000;

const uid = (req: Request): string => (req as CustomRequest).user!.userId;

const mondayOf = (d: Date): string => {
  const date = new Date(d);
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
};

export const getPreferenceController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const pref = await prisma.jobPreference.findUnique({ where: { userId } });
  res.status(200).json({ preference: pref });
};

export const setPreferenceController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const { roleIds, level, location, remote, keywords, blocklist, active } = req.body;

  const roles = await selectedJobRoles(roleIds);
  const requestedRoleCount = Array.isArray(roleIds) ? new Set(roleIds).size : 0;
  if (roles.length === 0 || roles.length !== requestedRoleCount) {
    res.status(400).json({ code: "INVALID_JOB_ROLES", message: "Select between one and five available roles." });
    return;
  }

  const data = {
    role: roles.map((role) => role.name).join(" | "),
    roleIds: roles.map((role) => role.id),
    level: level ? String(level).slice(0, 20) : null,
    location: location ? String(location).slice(0, 100) : null,
    remote: remote === true,
    keywords: keywords ? String(keywords).slice(0, 300) : null,
    blocklist: blocklist ? String(blocklist).slice(0, 500) : null,
    active: active !== false,
  };

  const pref = await prisma.jobPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  const refreshed = await refreshMatchesForUser(userId);
  const matches = await listMatches(userId, 1);
  res.status(200).json({ preference: pref, refreshed, ...matches });
};

export const getMatchesController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const page = Number(req.query.page) || 1;
  const country = typeof req.query.country === "string" && req.query.country ? req.query.country : undefined;
  const result = await listMatches(userId, page, country);
  res.status(200).json(result);
};

export const updateMatchStatusController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUS.includes(status)) {
    res.status(400).json({ message: "Invalid status." });
    return;
  }

  const match = await prisma.jobMatch.findFirst({ where: { id, userId } });
  if (!match) {
    res.status(404).json({ message: "Match not found." });
    return;
  }

  const stampApplied = status === "applied" && !match.appliedAt;
  const updated = await prisma.jobMatch.update({
    where: { id },
    data: { status, ...(stampApplied ? { appliedAt: new Date() } : {}) },
  });
  res.status(200).json({ match: updated });
};

export const refreshMatchesController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const count = await refreshMatchesForUser(userId);
  const result = await listMatches(userId, 1);
  res.status(200).json({ refreshed: count, ...result });
};

export const generateCoverLetterController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const { id } = req.params;

  const match = await prisma.jobMatch.findFirst({ where: { id, userId } });
  if (!match) {
    res.status(404).json({ message: "Match not found." });
    return;
  }

  // Default to the user's primary CV; fall back to text supplied by the client.
  let cvText = typeof req.body.cvText === "string" ? req.body.cvText.trim() : "";
  if (!cvText) {
    const primary = await getPrimaryCV(userId);
    if (primary) cvText = cvToPlainText(primary);
  }
  if (!cvText) {
    res.status(400).json({ message: "No CV found. Create a CV or pass cvText." });
    return;
  }

  const coverLetter = await generateCoverLetter(cvText.slice(0, MAX_CV_TEXT), {
    title: match.title,
    company: match.company,
    description: "",
  });

  const updated = await prisma.jobMatch.update({ where: { id }, data: { coverLetter } });
  res.status(200).json({ coverLetter: updated.coverLetter });
};

export const getAnalyticsController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const matches = await prisma.jobMatch.findMany({
    where: { userId },
    select: { status: true, appliedAt: true },
  });

  const totals = { matched: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };
  for (const m of matches) {
    if (m.status in totals) (totals as Record<string, number>)[m.status]++;
  }

  // "Ever applied" cohort — survives a later dismiss, so history isn't wiped.
  const appliedCohort = matches.filter((m) => m.appliedAt !== null);
  const totalMatches = matches.length;
  const applyRate = totalMatches ? appliedCohort.length / totalMatches : 0;
  const responseRate = appliedCohort.length
    ? (totals.interview + totals.offer) / appliedCohort.length
    : 0;

  const buckets = new Map<string, number>();
  for (const m of appliedCohort) {
    const week = mondayOf(m.appliedAt!);
    buckets.set(week, (buckets.get(week) ?? 0) + 1);
  }

  const thisMonday = new Date(`${mondayOf(new Date())}T00:00:00.000Z`);
  const byWeek: { week: string; applied: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(thisMonday);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const week = d.toISOString().slice(0, 10);
    byWeek.push({ week, applied: buckets.get(week) ?? 0 });
  }

  res.status(200).json({ totals, applyRate, responseRate, byWeek });
};

export const generateVariantsController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const { id } = req.params;
  const { cvText } = req.body;

  if (typeof cvText !== "string" || cvText.trim().length === 0) {
    res.status(400).json({ message: "cvText is required." });
    return;
  }

  const match = await prisma.jobMatch.findFirst({ where: { id, userId } });
  if (!match) {
    res.status(404).json({ message: "Match not found." });
    return;
  }

  const generated = await generateVariants(cvText.slice(0, MAX_CV_TEXT), {
    title: match.title,
    company: match.company,
  });

  const variants = await Promise.all(
    generated.map((v) =>
      prisma.cVVariant.create({
        data: { userId, jobMatchId: id, label: v.label, content: v.content },
        select: { id: true, label: true, content: true },
      })
    )
  );

  res.status(200).json({ variants });
};

export const updateVariantOutcomeController = async (req: Request, res: Response) => {
  const userId = uid(req);
  const { id } = req.params;
  const { sent, response } = req.body;

  const variant = await prisma.cVVariant.findFirst({ where: { id, userId } });
  if (!variant) {
    res.status(404).json({ message: "Variant not found." });
    return;
  }

  const updated = await prisma.cVVariant.update({
    where: { id },
    data: {
      sentCount: sent === true ? { increment: 1 } : undefined,
      responseCount: response === true ? { increment: 1 } : undefined,
    },
  });

  res.status(200).json({ variant: updated });
};
