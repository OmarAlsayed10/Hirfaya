interface AccessUser {
  role?: string;
  planTier?: string;
  proExpiresAt?: string | number | Date | null;
}

export const hasPaidAccess = (user: AccessUser | null | undefined): boolean => {
  if (user?.role === "admin") return true;
  const tier = String(user?.planTier || "").toLowerCase();
  if (!["pass", "pro", "ultra"].includes(tier)) return false;
  if (!user?.proExpiresAt) return false;
  const expiresAt = new Date(user.proExpiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
};

export const isProUser = hasPaidAccess;
