import { Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  addBannedIp,
  removeBannedIp,
  addBannedUser,
  removeBannedUser,
} from "../lib/banCache";
import { listAllPayments } from "../services/paymentService";
import { getAiStatus } from "../services/aiStatusService";
import { allowance, isRefillTier, monthKey } from "../services/quotaService";
import { deleteUserAccount } from "../services/accountDeletionService";
import { withSignedScreenshot } from "../services/importService";

// Must stay in step with the tiers plans are sold under (prisma/seed.ts) and with
// entitlementService.PAID_TIERS — omitting one makes that tier unassignable by an admin.
const VALID_TIERS = ["basic", "pass", "pro", "ultra"] as const;

// Admin accounts are unrestricted and must not be ban/revoke/plan targets —
// this blocks an admin from locking themselves (or another admin) out.
const rejectIfAdmin = async (id: string, res: Response): Promise<boolean> => {
  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!target) {
    res.status(404).json({ message: "User not found." });
    return true;
  }
  if (target.role === "admin") {
    res.status(403).json({ message: "Admin accounts cannot be modified." });
    return true;
  }
  return false;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const listUsersController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      planTier: true,
      banned: true,
      credits: true,
      bonusCredits: true,
      proExpiresAt: true,
      createdAt: true,
      _count: { select: { cvs: true, paymentRequests: true } },
    },
  });
  res.status(200).json({ users });
};

export const getUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      photo: true,
      role: true,
      planTier: true,
      banned: true,
      bannedReason: true,
      lastIp: true,
      credits: true,
      bonusCredits: true,
      creditPeriod: true,
      proExpiresAt: true,
      googleId: true,
      createdAt: true,
      cvs: {
        select: {
          id: true,
          isPrimary: true,
          cloudinaryUrl: true,
          personalInfo: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      paymentRequests: {
        select: {
          id: true,
          status: true,
          amountSnapshot: true,
          currency: true,
          referenceNumber: true,
          screenshotUrl: true,
          rejectionReason: true,
          createdAt: true,
          reviewedAt: true,
          plan: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  res.status(200).json({
    user: { ...user, paymentRequests: user.paymentRequests.map(withSignedScreenshot) },
  });
};

export const deleteUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (await rejectIfAdmin(req.params.id, res)) return;

    const deleted = await deleteUserAccount(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: "User account permanently deleted.",
      userId: req.params.id,
    });
  } catch (error) {
    console.error("Admin account deletion error:", error);
    res.status(500).json({ message: "Failed to delete user account." });
  }
};
export const banUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { reason } = req.body;
  if (await rejectIfAdmin(req.params.id, res)) return;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { banned: true, bannedReason: reason ?? null },
    select: { id: true, banned: true, bannedReason: true },
  });
  addBannedUser(user.id);
  res.status(200).json({ message: "User banned.", user });
};

export const unbanUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { banned: false, bannedReason: null },
    select: { id: true, banned: true },
  });
  removeBannedUser(user.id);
  res.status(200).json({ message: "User unbanned.", user });
};

export const revokeProController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (await rejectIfAdmin(req.params.id, res)) return;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      planTier: "basic",
      proExpiresAt: null,
      credits: allowance("basic"),
      bonusCredits: 0,
      creditPeriod: null,
    },
    select: { id: true, role: true, planTier: true, proExpiresAt: true },
  });
  res.status(200).json({ message: "Pro subscription revoked.", user });
};

export const setPlanController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { planTier, durationDays } = req.body;
  if (!VALID_TIERS.includes(planTier)) {
    res.status(400).json({ message: `planTier must be one of ${VALID_TIERS.join(", ")}.` });
    return;
  }
  if (await rejectIfAdmin(req.params.id, res)) return;

  const existing = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { proExpiresAt: true },
  });
  if (!existing) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  const isPaid = planTier !== "basic";
  const now = Date.now();
  const stillValid = existing.proExpiresAt && existing.proExpiresAt.getTime() > now;
  const days = Number(durationDays) > 0 ? Number(durationDays) : 30;
  const proExpiresAt = !isPaid
    ? null
    : stillValid
    ? existing.proExpiresAt
    : new Date(now + days * 24 * 60 * 60 * 1000);

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      planTier,
      proExpiresAt,
      credits: allowance(planTier),
      creditPeriod: isRefillTier(planTier) ? monthKey() : null,
    },
    select: { id: true, role: true, planTier: true, proExpiresAt: true },
  });
  res.status(200).json({ message: "Plan updated.", user });
};

export const grantAnalysesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const amount = Number(req.body.amount);
  if (await rejectIfAdmin(req.params.id, res)) return;
  if (!Number.isInteger(amount) || amount === 0) {
    res.status(400).json({ message: "amount must be a non-zero integer." });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { bonusCredits: true },
  });
  if (!existing) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  const next = Math.max(0, existing.bonusCredits + amount);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { bonusCredits: next },
    select: { id: true, bonusCredits: true },
  });
  res.status(200).json({ message: "Bonus credits updated.", user });
};

// ─── Banned IPs ───────────────────────────────────────────────────────────────

export const listBannedIpsController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const ips = await prisma.bannedIp.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json({ ips });
};

export const banIpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { ip, reason } = req.body;
  if (!ip || typeof ip !== "string") {
    res.status(400).json({ message: "ip is required." });
    return;
  }
  const record = await prisma.bannedIp.upsert({
    where: { ip },
    create: { ip, reason: reason ?? null },
    update: { reason: reason ?? null },
  });
  addBannedIp(record.ip);
  res.status(200).json({ message: "IP banned.", ip: record });
};

export const unbanIpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const ip = req.params.ip;
  await prisma.bannedIp.delete({ where: { ip } }).catch(() => null);
  removeBannedIp(ip);
  res.status(200).json({ message: "IP unbanned." });
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const listAllPaymentsController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const requests = await listAllPayments();
  res.status(200).json({ requests: requests.map(withSignedScreenshot) });
};

// ─── AI status ────────────────────────────────────────────────────────────────

export const aiStatusController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json(await getAiStatus());
};
