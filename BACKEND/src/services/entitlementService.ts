export const PAID_TIERS = ["pass", "pro", "ultra"] as const;
const PAID_TIER_SET = new Set<string>(PAID_TIERS);

interface EntitlementUser {
  role: string;
  planTier: string;
  proExpiresAt: Date | null;
}

export const hasPaidAccess = (user: EntitlementUser, now = Date.now()): boolean => {
  if (user.role === "admin") return true;
  return PAID_TIER_SET.has(user.planTier) && !!user.proExpiresAt && user.proExpiresAt.getTime() > now;
};
