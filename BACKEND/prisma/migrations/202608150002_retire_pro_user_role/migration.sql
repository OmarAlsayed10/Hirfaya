-- Paid access is decided by planTier + proExpiresAt (see entitlementService.hasPaidAccess).
-- `role` carrying a third value, "pro user", meant the same fact was stored twice and could
-- disagree — an expired user whose row still said "pro user", or a paid user the expiry cron
-- skipped because it filtered on role. Nothing writes "pro user" any more, so retire the
-- leftover rows. Entitlement is unaffected: planTier and proExpiresAt already carry it.
UPDATE "User" SET role = 'normal user' WHERE role = 'pro user';
