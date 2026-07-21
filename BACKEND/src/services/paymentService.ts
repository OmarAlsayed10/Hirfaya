import prisma from "../lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { fixedTopupSnapshot } from "./creditPurchaseService";
import { assertCommercialPriceIsSafe } from "./creditPricingService";

// ─── Plans ────────────────────────────────────────────────────────────────────

export const getActivePlans = () =>
  prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      displayName: true,
      priceEGP: true,
      durationDays: true,
      tier: true,
      kind: true,
      grantCredits: true,
    },
  });

export const getPlanById = (planId: string) =>
  prisma.plan.findFirst({
    where: { id: planId, isActive: true },
  });

// ─── InstaPay details (bank config from env + plan-specific amount) ───────────

export interface InstapayDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  amountEGP: string;
  currency: "EGP";
  planDisplayName: string;
  durationDays: number;
  instructions: string[];
}

export const buildInstapayDetails = (plan: {
  displayName: string;
  priceEGP: { toString(): string };
  durationDays: number;
}): InstapayDetails => {
  const bankName = process.env.INSTAPAY_BANK_NAME!;
  const accountName = process.env.INSTAPAY_ACCOUNT_NAME!;
  const accountNumber = process.env.INSTAPAY_ACCOUNT_NUMBER!;
  const amount = plan.priceEGP.toString();

  return {
    bankName,
    accountName,
    accountNumber,
    amountEGP: amount,
    currency: "EGP",
    planDisplayName: plan.displayName,
    durationDays: plan.durationDays,
    instructions: [
      "Open your InstaPay app",
      `Send to: ${bankName} — ${accountName} (${accountNumber})`,
      `Exact amount: ${amount} EGP`,
      "Copy the reference number shown after the transfer",
      "Come back here and submit the reference number with your screenshot",
    ],
  };
};

// ─── Payment requests ─────────────────────────────────────────────────────────

export const submitPaymentRequest = async (
  userId: string,
  planId: string,
  referenceNumber: string,
  screenshotUrl: string
) => {
  const [pending, plan] = await Promise.all([
    prisma.paymentRequest.findFirst({
      where: { userId, status: PaymentStatus.PENDING },
    }),
    getPlanById(planId),
  ]);

  if (pending) throw new Error("PENDING_EXISTS");
  if (!plan) throw new Error("PLAN_NOT_FOUND");
  if (plan.kind === "topup") assertCommercialPriceIsSafe();

  return prisma.paymentRequest.create({
    data: {
      userId,
      planId,
      amountSnapshot: plan.priceEGP,
      ...fixedTopupSnapshot(plan),
      referenceNumber,
      screenshotUrl,
    },
    include: { plan: true },
  });
};

export const getLatestPaymentStatus = (userId: string) =>
  prisma.paymentRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      amountSnapshot: true,
      purchaseKind: true,
      grantCreditsSnapshot: true,
      pricingVersion: true,
      currency: true,
      referenceNumber: true,
      rejectionReason: true,
      createdAt: true,
      reviewedAt: true,
      plan: { select: { slug: true, displayName: true, durationDays: true } },
    },
  });


export const listPendingPayments = () =>
  prisma.paymentRequest.findMany({
    where: { status: PaymentStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      plan: { select: { slug: true, displayName: true } },
    },
  });

export const listAllPayments = () =>
  prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      plan: { select: { slug: true, displayName: true } },
    },
  });

export const rejectPaymentRequest = async (
  requestId: string,
  reason: string
) => {
  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request) throw new Error("NOT_FOUND");
  if (request.status !== PaymentStatus.PENDING) throw new Error("NOT_PENDING");

  return prisma.paymentRequest.update({
    where: { id: requestId },
    data: {
      status: PaymentStatus.REJECTED,
      rejectionReason: reason,
      reviewedAt: new Date(),
    },
    include: { user: true },
  });
};
