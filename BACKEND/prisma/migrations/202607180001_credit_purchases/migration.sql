CREATE TYPE "PaymentPurchaseKind" AS ENUM ('SUBSCRIPTION', 'FIXED_TOPUP', 'CUSTOM_TOPUP');

ALTER TABLE "payment_requests"
  ALTER COLUMN "planId" DROP NOT NULL,
  ADD COLUMN "purchaseKind" "PaymentPurchaseKind" NOT NULL DEFAULT 'SUBSCRIPTION',
  ADD COLUMN "grantCreditsSnapshot" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "pricingVersion" TEXT;

UPDATE "payment_requests" AS payment
SET
  "purchaseKind" = CASE
    WHEN plan.kind = 'topup' THEN 'FIXED_TOPUP'::"PaymentPurchaseKind"
    ELSE 'SUBSCRIPTION'::"PaymentPurchaseKind"
  END,
  "grantCreditsSnapshot" = CASE
    WHEN plan.kind = 'topup' THEN plan."grantCredits"
    ELSE 0
  END
FROM "plans" AS plan
WHERE payment."planId" = plan.id;

UPDATE "User"
SET "lastName" = ''
WHERE "googleId" IS NOT NULL AND "lastName" = 'Unknown';

UPDATE "plans"
SET "isActive" = false
WHERE slug IN ('topup-300', 'topup-1000');

INSERT INTO "plans" (
  id, slug, "displayName", "priceEGP", "durationDays", tier, kind,
  "grantCredits", "sortOrder", "isActive", "createdAt"
)
VALUES
  (gen_random_uuid()::text, 'topup-100', '+100 Credits', 70.00, 0, 'pro', 'topup', 100, 5, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'topup-500', '+500 Credits', 350.00, 0, 'pro', 'topup', 500, 6, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'topup-1500', '+1500 Credits', 1050.00, 0, 'pro', 'topup', 1500, 7, true, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  "priceEGP" = EXCLUDED."priceEGP",
  "durationDays" = EXCLUDED."durationDays",
  tier = EXCLUDED.tier,
  kind = EXCLUDED.kind,
  "grantCredits" = EXCLUDED."grantCredits",
  "sortOrder" = EXCLUDED."sortOrder",
  "isActive" = true;
