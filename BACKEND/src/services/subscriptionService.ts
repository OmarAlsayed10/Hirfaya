import prisma from "../lib/prisma";
import { allowance, isRefillTier, monthKey } from "./quotaService";

/**
 * Activates a Pro subscription for a user.
 * This is the app-specific counterpart to the generic payment module.
 * To reuse the payment module in another app, replace this file's logic.
 */
interface ActivatePlan {
  durationDays: number;
  tier: string;
  kind: string;
  grantCredits: number;
}

export const activateSubscription = async (
  userId: string,
  plan: ActivatePlan
) => {
  if (plan.kind === "topup") {
    return prisma.user.update({
      where: { id: userId },
      data: { bonusCredits: { increment: plan.grantCredits } },
    });
  }

  const expiresAt = new Date(
    Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
  );

  return prisma.user.update({
    where: { id: userId },
    data: {
      planTier: plan.tier,
      proExpiresAt: expiresAt,
      credits: allowance(plan.tier),
      creditPeriod: isRefillTier(plan.tier) ? monthKey() : null,
    },
  });
};
