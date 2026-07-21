const PAID_TIERS = new Set(["pass", "pro", "ultra"]);

interface EntitlementUser {
  role: string;
  planTier: string;
  proExpiresAt: Date | null;
}

export const hasPaidAccess = (user: EntitlementUser, now = Date.now()): boolean => {
  if (user.role === "admin") return true;
  return PAID_TIERS.has(user.planTier) && !!user.proExpiresAt && user.proExpiresAt.getTime() > now;
};
