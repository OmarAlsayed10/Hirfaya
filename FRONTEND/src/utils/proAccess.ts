interface AccessUser {
  role?: string;
  isPro?: boolean;
}

// Entitlement is decided once, on the server (entitlementService.hasPaidAccess), and sent
// as `isPro` on every auth payload. The client only reads that answer — it deliberately
// does not re-derive it from planTier and proExpiresAt, because a second copy of the rule
// is a copy that can disagree. A missing flag means "not paid": this gates UI only, the
// backend enforces access on its own with requireProUser.
export const hasPaidAccess = (user: AccessUser | null | undefined): boolean =>
  user?.role === "admin" || user?.isPro === true;
